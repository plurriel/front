import React from 'react';

import { Editor } from '@tinymce/tinymce-react';

// TinyMCE so the global var exists
// eslint-disable-next-line no-unused-vars
import tinymce from 'tinymce/tinymce';
// DOM model
import 'tinymce/models/dom/model';
// Theme
import 'tinymce/themes/silver';
// Toolbar icons
import 'tinymce/icons/default';
// Editor styles
// import 'tinymce/skins/ui/oxide/skin.min.css';

// importing the plugin js.
// if you use a plugin that is not listed here the editor will fail to load
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/image';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/save';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/template';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/wordcount';

// importing plugin resources
import 'tinymce/plugins/emoticons/js/emojis';
// eslint-disable-next-line import/no-extraneous-dependencies
import { InferProps } from 'prop-types';

// Content styles, including inline UI like fake cursors
/* eslint import/no-webpack-loader-syntax: off */
// import contentCss from 'tinymce/skins/content/default/content.min.css';
// import contentUiCss from 'tinymce/skins/ui/oxide/content.min.css';

const newIconPack = Object.fromEntries(
  Object.entries(tinymce.IconManager.get('default').icons)
    .map(([key, value]) => [key, value
      .replace(/<svg width="24" height="24"/g, '<svg viewbox="0 0 24 24" width="1em" height="1em"')]),
);

newIconPack.reply = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960"><path d="M814-183q-20 0-33.5-13.5T767-230v-144q0-48-33-80.5T654-487H279l105 105q13 13 12.5 32T383-317q-14 14-33.5 14T316-317L132-501q-7-7-10-15.5t-3-17.5q0-9 3-17.5t10-15.5l185-185q13-13 32.5-13t33.5 14q14 14 14 33t-14 33L279-581h375q86 0 146.5 60T861-374v144q0 20-13.5 33.5T814-183Z"/></svg>';
newIconPack.replyall = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960"><path d="M262-298 68-491q-7-7-10.5-15.5T54-524q0-9 3.5-17.5T68-557l195-195q13-13 33-13t34 14q13 14 13 33.5T329-684L169-524l161 161q14 14 13.5 32.5T329-298q-14 14-33.5 14T262-298Zm615 115q-20 0-33.5-13.5T830-230v-126q0-54-34-87.5T709-477H444l114 114q14 14 13 32.5T556-298q-14 14-33.5 14T490-298L297-491q-7-7-10.5-15.5T283-524q0-9 3.5-17.5T297-557l194-195q13-13 33-13t34 14q13 14 13 33.5T557-684L444-571h265q91 0 153 62t62 153v126q0 20-13.5 33.5T877-183Z"/></svg>';

tinymce.IconManager.add('adaptive_default', { icons: newIconPack });

export default function BundledEditor(props: InferProps<typeof Editor.propTypes>) {
  if (!props) return null;
  const { init, ...rest } = props as any;

  // note that skin and content_css is disabled to avoid the normal
  // loading process and is instead loaded as a string via content_style
  return (
    <Editor
      init={{
        ...init,
        skin: false,
        content_css: false,
      }}
      {...rest}
    />
  );
}
