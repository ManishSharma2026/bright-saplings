<?php
/**
 * Fallback template.
 *
 * WordPress requires index.php in every theme. Because this is a one-page
 * site, anything that is not the front page falls back to the same layout.
 *
 * If you later add real blog posts or inner pages, replace the body of this
 * file with a standard loop and add page.php / single.php.
 *
 * @package BrightSaplings
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<?php if ( have_posts() && ! is_front_page() ) : ?>

  <section class="section">
    <div class="wrap">
      <?php
      while ( have_posts() ) :
        the_post();
        ?>
        <article <?php post_class(); ?>>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> <?php echo esc_html( get_the_date() ); ?></p>
          <h1 class="section__title"><?php the_title(); ?></h1>
          <div class="lede"><?php the_content(); ?></div>
        </article>
        <?php
      endwhile;

      the_posts_pagination();
      ?>
    </div>
  </section>

<?php else : ?>

  <?php
  get_template_part( 'template-parts/section', 'hero' );
  get_template_part( 'template-parts/section', 'about' );
  get_template_part( 'template-parts/section', 'programs' );
  get_template_part( 'template-parts/section', 'activities' );
  get_template_part( 'template-parts/section', 'food' );
  get_template_part( 'template-parts/section', 'location' );
  get_template_part( 'template-parts/section', 'contact' );
  ?>

<?php endif; ?>

<?php
get_footer();
