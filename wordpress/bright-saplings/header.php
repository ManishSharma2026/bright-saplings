<?php
/**
 * Header: everything up to the opening <main> tag.
 *
 * Mirrors src/sections/01-header.html, with WordPress hooks added.
 *
 * @package BrightSaplings
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f7f8f7">
<link rel="profile" href="https://gmpg.org/xfn/11">

<?php
/*
 * The <title>, description and canonical tag come from WordPress
 * (add_theme_support('title-tag')) or from your SEO plugin.
 *
 * Set your favicon and social share image under
 * Appearance -> Customize -> Site Identity, or upload
 * images/og-image.jpg (1200x630) and reference it with an SEO plugin.
 */
wp_head();
?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link" href="#main"><?php esc_html_e( 'Skip to content', 'bright-saplings' ); ?></a>

<!-- ============================================================
     STICKY HEADER
     ============================================================ -->
<header class="site-header" id="siteHeader">
  <div class="wrap header__inner">

    <a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>#top" aria-label="<?php echo esc_attr( bright_saplings_info( 'name' ) . ', back to top' ); ?>">
      <span class="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 28V13"/>
          <path d="M16 15c0-4 3-7 7-7 0 4-3 7-7 7Z"/>
          <path d="M16 21c0-3.5-2.7-6-6-6 0 3.5 2.7 6 6 6Z"/>
        </svg>
      </span>
      <span class="brand__text"><?php echo esc_html( bright_saplings_info( 'short' ) ); ?><span class="brand__sub"><?php echo esc_html( bright_saplings_info( 'tagline' ) ); ?></span></span>
    </a>

    <?php
    /*
     * One-page site, so these are hard-coded anchor links on purpose —
     * a WordPress menu cannot point at #about without extra work.
     *
     * If you later split this into real pages, replace the <ul> below with:
     *
     *   wp_nav_menu( array(
     *       'theme_location' => 'primary',
     *       'container'      => false,
     *       'menu_class'     => 'nav__list',
     *   ) );
     *
     * and add `.nav__list a` next to `.nav__link` in section-header.css.
     */
    ?>
    <nav class="nav" id="primaryNav" aria-label="<?php esc_attr_e( 'Primary', 'bright-saplings' ); ?>">
      <ul class="nav__list">
        <li><a class="nav__link" href="#about"><?php esc_html_e( 'About', 'bright-saplings' ); ?></a></li>
        <li><a class="nav__link" href="#programs"><?php esc_html_e( 'Programs', 'bright-saplings' ); ?></a></li>
        <li><a class="nav__link" href="#day"><?php esc_html_e( 'Our Day', 'bright-saplings' ); ?></a></li>
        <li><a class="nav__link" href="#safety"><?php esc_html_e( 'Safety', 'bright-saplings' ); ?></a></li>
        <li><a class="nav__link" href="#team"><?php esc_html_e( 'Team', 'bright-saplings' ); ?></a></li>
        <li><a class="nav__link" href="#gallery"><?php esc_html_e( 'Gallery', 'bright-saplings' ); ?></a></li>
        <li><a class="nav__link" href="#tuition"><?php esc_html_e( 'Tuition', 'bright-saplings' ); ?></a></li>
        <li><a class="nav__link" href="#contact"><?php esc_html_e( 'Contact', 'bright-saplings' ); ?></a></li>
      </ul>
      <a class="btn btn--primary btn--sm nav__cta" href="#contact"><?php esc_html_e( 'Schedule a Tour', 'bright-saplings' ); ?></a>
    </nav>

    <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="primaryNav" aria-label="<?php esc_attr_e( 'Open menu', 'bright-saplings' ); ?>">
      <span class="nav-toggle__bar"></span>
      <span class="nav-toggle__bar"></span>
      <span class="nav-toggle__bar"></span>
    </button>

  </div>
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
</header>

<div class="nav-scrim" id="navScrim" hidden></div>

<main id="main">
