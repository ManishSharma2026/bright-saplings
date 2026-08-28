"""Photo restoration for the two client snapshots.

The important idea here is that these are old phone JPEGs, and on old
phone sensors the noise is overwhelmingly in the COLOUR channels, not
the brightness one. So everything below works in YCrCb: chroma gets
denoised hard, luma barely at all, and all the sharpening happens on
luma only. That is what stops the "plastic skin" look — the first
attempt denoised the whole RGB image and wiped out hair and eyelashes.
"""
import cv2, numpy as np, os

MODEL = '/home/claude/FSRCNN_x4.pb'


def white_balance(img, pct=99.2):
    out = img.astype(np.float32)
    for c in range(3):
        p = np.percentile(out[:, :, c], pct)
        if p > 1:
            out[:, :, c] *= 255.0 / p
    return np.clip(out, 0, 255).astype(np.uint8)


def split(img):
    y, cr, cb = cv2.split(cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb))
    return y, cr, cb


def merge(y, cr, cb):
    return cv2.cvtColor(cv2.merge((y, cr, cb)), cv2.COLOR_YCrCb2BGR)


def clean(img, luma=3, chroma=14):
    """Denoise colour hard, brightness gently."""
    y, cr, cb = split(img)
    y  = cv2.fastNlMeansDenoising(y, None, luma, 7, 21)
    cr = cv2.fastNlMeansDenoising(cr, None, chroma, 7, 21)
    cb = cv2.fastNlMeansDenoising(cb, None, chroma, 7, 21)
    return merge(y, cr, cb)


def tone(img, shadow=0.24, black=2, white=250):
    """Lift the shadows, then set the black and white points.

    Both photos are indoor, underexposed and low-contrast: nothing in
    them reaches true black or true white, so the histogram is a narrow
    band in the middle and everything looks washed.
    """
    y, cr, cb = split(img)
    f = y.astype(np.float32) / 255.0
    w = (1.0 - f) ** 2
    f = f * (1 - w) + (f ** (1.0 - shadow)) * w          # shadow-weighted lift
    f = np.clip((f * 255 - black) * (255.0 / (white - black)), 0, 255)
    return merge(f.astype(np.uint8), cr, cb)


def local_contrast(img, clip=1.25, grid=10):
    y, cr, cb = split(img)
    y = cv2.createCLAHE(clipLimit=clip, tileGridSize=(grid, grid)).apply(y)
    return merge(y, cr, cb)


def superres(img, scale=4):
    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(MODEL)
    sr.setModel('fsrcnn', scale)
    return sr.upsample(img)


def sharpen_luma(img, radius=1.1, amount=0.55, threshold=4):
    """Unsharp mask on brightness only, and only where there is an edge.

    The threshold matters: without it the mask amplifies the sensor
    grain in flat areas (a wall, a cheek) as enthusiastically as it
    sharpens an eyelash.
    """
    y, cr, cb = split(img)
    blur = cv2.GaussianBlur(y, (0, 0), radius)
    diff = y.astype(np.float32) - blur.astype(np.float32)
    diff[np.abs(diff) < threshold] = 0
    y = np.clip(y.astype(np.float32) + amount * diff, 0, 255).astype(np.uint8)
    return merge(y, cr, cb)


def saturate(img, f=1.10):
    y, cr, cb = split(img)
    cr = np.clip((cr.astype(np.float32) - 128) * f + 128, 0, 255).astype(np.uint8)
    cb = np.clip((cb.astype(np.float32) - 128) * f + 128, 0, 255).astype(np.uint8)
    return merge(y, cr, cb)


def warm(img, amount=0.03):
    out = img.astype(np.float32)
    out[:, :, 2] *= (1 + amount)
    out[:, :, 0] *= (1 - amount * 0.6)
    return np.clip(out, 0, 255).astype(np.uint8)


def restore(path, target_w, sr_scale=4):
    im = cv2.imread(path)
    im = white_balance(im)
    im = clean(im)
    im = tone(im)
    im = local_contrast(im)
    im = superres(im, sr_scale)            # 4x, then come back down
    h, w = im.shape[:2]
    im = cv2.resize(im, (target_w, int(h * target_w / w)), interpolation=cv2.INTER_AREA)
    im = sharpen_luma(im)
    im = saturate(im)
    im = warm(im)
    return im
