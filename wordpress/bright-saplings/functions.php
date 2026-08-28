<?php
/**
 * Bright Saplings theme functions.
 *
 * @package BrightSaplings
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BRIGHT_SAPLINGS_VERSION', '1.0.0' );

/**
 * Load the individual per-section stylesheets instead of the single bundle.
 *
 * Set this to true while you are editing one section and want to see exactly
 * which file a rule came from in DevTools. Leave it false on the live site —
 * one request is faster than twenty.
 */
define( 'BRIGHT_SAPLINGS_SPLIT_CSS', false );


/**
 * Theme supports.
 */
function bright_saplings_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'custom-logo', array(
		'height'      => 64,
		'width'       => 64,
		'flex-height' => true,
		'flex-width'  => true,
	) );

	// Registered for later — the front page uses hard-coded anchor links,
	// which is the right call for a one-page site. See header.php.
	register_nav_menus( array(
		'primary' => __( 'Primary Menu', 'bright-saplings' ),
		'footer'  => __( 'Footer Menu', 'bright-saplings' ),
	) );
}
add_action( 'after_setup_theme', 'bright_saplings_setup' );


/**
 * The CSS parts, in the order they must load.
 *
 * Mirrors BUILD_ORDER in build.py. If you add a section, add it here too.
 *
 * @return string[]
 */
function bright_saplings_css_parts() {
	return array(
		'00-tokens',
		'01-base',
		'02-layout',
		'03-typography',
		'04-buttons',
		'05-image-placeholders',
		'06-cards',
		'section-header',
		'section-hero',
		'section-about',
		'section-story',
		'section-programs',
		'section-activities',
		'section-food',
		'section-location',
		'section-contact',
		'section-footer',
		'07-animations',
	);
}
/**
 * Enqueue styles and scripts.
 */
function bright_saplings_assets() {
	$uri = get_template_directory_uri();

	/*
	 * No webfont request here on purpose. Fraunces and Karla are served
	 * from assets/fonts/ via @font-face at the top of the stylesheet, so
	 * the theme loads nothing from Google and works behind a firewall.
	 */

	if ( BRIGHT_SAPLINGS_SPLIT_CSS ) {
		$previous = '';
		foreach ( bright_saplings_css_parts() as $part ) {
			$handle = 'bright-saplings-' . $part;
			wp_enqueue_style(
				$handle,
				$uri . '/assets/css/part-' . $part . '.css',
				$previous ? array( $previous ) : array(),   // keeps cascade order
				BRIGHT_SAPLINGS_VERSION
			);
			$previous = $handle;
		}
	} else {
		wp_enqueue_style(
			'bright-saplings',
			$uri . '/assets/css/style.css',
			array(),
			BRIGHT_SAPLINGS_VERSION
		);
	}

	// WordPress requires style.css to be registered for child themes to work.
	wp_register_style( 'bright-saplings-theme', get_stylesheet_uri(), array(), BRIGHT_SAPLINGS_VERSION );
	wp_enqueue_style( 'bright-saplings-theme' );

	wp_enqueue_script(
		'bright-saplings',
		$uri . '/assets/js/script.js',
		array(),
		BRIGHT_SAPLINGS_VERSION,
		true                                  // in the footer
	);
}
add_action( 'wp_enqueue_scripts', 'bright_saplings_assets' );


/**
 * Add defer to the theme script.
 *
 * @param string $tag    The script tag.
 * @param string $handle Script handle.
 * @return string
 */
function bright_saplings_defer_script( $tag, $handle ) {
	if ( 'bright-saplings' === $handle ) {
		return str_replace( ' src=', ' defer src=', $tag );
	}
	return $tag;
}
add_filter( 'script_loader_tag', 'bright_saplings_defer_script', 10, 2 );


/**
 * Drop the `no-js` class as early as possible so .reveal elements are not
 * left invisible if JavaScript is disabled.
 */
function bright_saplings_no_js_class() {
	echo "<script>document.documentElement.classList.remove('no-js');</script>\n";
}
add_action( 'wp_body_open', 'bright_saplings_no_js_class', 1 );


/**
 * Business details in one place.
 *
 * Edit these once and every template picks up the change. If you would rather
 * manage them from the WordPress admin, replace each value with a call to
 * get_theme_mod() and register the settings in the Customizer.
 *
 * @param string $key Which detail to return.
 * @return string
 */
function bright_saplings_info( $key ) {
	$info = array(
			'name'      => 'Bright Saplings Daycare',
			'short'     => 'Bright Saplings',
			'tagline'   => 'Daycare',
			'motto'     => 'Growing bright minds, one child at a time',
			'phone'     => '425-428-9660',
			'phone_raw' => '+14254289660',
			'city'      => 'Bothell, WA',
			'hours'     => 'Monday – Friday, 8:00am – 6:00pm',
			'ages'      => '18 months to 5 years',
		);

	return isset( $info[ $key ] ) ? $info[ $key ] : '';
}
