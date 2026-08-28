<?php
/**
 * Footer: closes <main>, prints the site footer.
 *
 * Mirrors src/sections/12-footer.html, with WordPress hooks added.
 *
 * @package BrightSaplings
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
</main>

<!-- ============================================================
     FOOTER
     ============================================================ -->
<footer class="site-footer">
  <div class="wrap footer__inner">

    <div class="footer__brand">
      <a class="brand brand--footer" href="<?php echo esc_url( home_url( '/' ) ); ?>#top">
        <span class="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 28V13"/><path d="M16 15c0-4 3-7 7-7 0 4-3 7-7 7Z"/><path d="M16 21c0-3.5-2.7-6-6-6 0 3.5 2.7 6 6 6Z"/>
          </svg>
        </span>
        <span class="brand__text"><?php echo esc_html( bright_saplings_info( 'short' ) ); ?><span class="brand__sub"><?php echo esc_html( bright_saplings_info( 'tagline' ) ); ?></span></span>
      </a>
      <p>
        <?php
        printf(
          /* translators: 1: city, 2: age range, 3: year opened */
          esc_html__( 'Licensed in-home childcare in %1$s. Serving %2$s since %3$s.', 'bright-saplings' ),
          esc_html( bright_saplings_info( 'city' ) ),
          esc_html( bright_saplings_info( 'ages' ) ),
          esc_html( bright_saplings_info( 'since' ) )
        );
        ?>
      </p>

      <ul class="social">
        <li>
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>
            </svg>
          </a>
        </li>
        <li>
          <a href="#" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v4H8v7h4v-7h3l1-4h-4V7.5A1.5 1.5 0 0 1 13.5 6H16V3Z"/>
            </svg>
          </a>
        </li>
        <li>
          <a href="mailto:<?php echo esc_attr( bright_saplings_info( 'email' ) ); ?>" aria-label="<?php esc_attr_e( 'Email us', 'bright-saplings' ); ?>">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/>
            </svg>
          </a>
        </li>
      </ul>
    </div>

    <nav class="footer__nav" aria-label="<?php esc_attr_e( 'Footer', 'bright-saplings' ); ?>">
      <div>
        <h4><?php esc_html_e( 'Explore', 'bright-saplings' ); ?></h4>
        <ul>
          <li><a href="#about"><?php esc_html_e( 'About', 'bright-saplings' ); ?></a></li>
          <li><a href="#programs"><?php esc_html_e( 'Programs', 'bright-saplings' ); ?></a></li>
          <li><a href="#day"><?php esc_html_e( 'Our Day', 'bright-saplings' ); ?></a></li>
          <li><a href="#gallery"><?php esc_html_e( 'Gallery', 'bright-saplings' ); ?></a></li>
        </ul>
      </div>
      <div>
        <h4><?php esc_html_e( 'Enroll', 'bright-saplings' ); ?></h4>
        <ul>
          <li><a href="#tuition"><?php esc_html_e( 'Tuition', 'bright-saplings' ); ?></a></li>
          <li><a href="#safety"><?php esc_html_e( 'Safety', 'bright-saplings' ); ?></a></li>
          <li><a href="#contact"><?php esc_html_e( 'Schedule a tour', 'bright-saplings' ); ?></a></li>
          <li><a href="#team"><?php esc_html_e( 'Our team', 'bright-saplings' ); ?></a></li>
        </ul>
      </div>
      <div>
        <h4><?php esc_html_e( 'Reach us', 'bright-saplings' ); ?></h4>
        <ul>
          <li><a href="tel:<?php echo esc_attr( bright_saplings_info( 'phone_raw' ) ); ?>"><?php echo esc_html( bright_saplings_info( 'phone' ) ); ?></a></li>
          <li><a href="mailto:<?php echo esc_attr( bright_saplings_info( 'email' ) ); ?>"><?php esc_html_e( 'Email us', 'bright-saplings' ); ?></a></li>
          <li><span><?php echo esc_html( bright_saplings_info( 'hours' ) ); ?></span></li>
          <li><span><?php echo esc_html( bright_saplings_info( 'city' ) ); ?></span></li>
        </ul>
      </div>
    </nav>

  </div>

  <div class="wrap footer__bottom">
    <p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( bright_saplings_info( 'name' ) ); ?>. <?php esc_html_e( 'All rights reserved.', 'bright-saplings' ); ?></p>
    <p><?php esc_html_e( 'License', 'bright-saplings' ); ?> #<?php echo esc_html( bright_saplings_info( 'license' ) ); ?> &middot; <a href="#top"><?php esc_html_e( 'Back to top', 'bright-saplings' ); ?></a></p>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
