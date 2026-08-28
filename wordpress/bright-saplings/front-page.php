<?php
/**
 * The one-page front page.
 *
 * Each section is a separate file in template-parts/. To reorder the page,
 * move a line. To remove a section, delete or comment out a line. To add one,
 * drop a new file in template-parts/ and call it here.
 *
 * @package BrightSaplings
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

get_template_part( 'template-parts/section', 'hero' );
get_template_part( 'template-parts/section', 'about' );
get_template_part( 'template-parts/section', 'story' );
get_template_part( 'template-parts/section', 'programs' );
get_template_part( 'template-parts/section', 'activities' );
get_template_part( 'template-parts/section', 'food' );
get_template_part( 'template-parts/section', 'location' );
get_template_part( 'template-parts/section', 'contact' );

get_footer();
