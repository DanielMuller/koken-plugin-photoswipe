Koken Photoswipe Plugin
=======================
Disclaimer
-----------------
This repo is now archieved.

I am no longer a user of [Koken](http://koken.me/) and have migrated my Gallery to [Yapawa](https://yapawa.net/), a gallery site that I developped.

Thank you Koken Team for your awesome tool that allowed me to host my pictures during many years.

---

Usage limitations
-----------------
- This plugin is originally developped for the Axis Theme (version 1). On other Themes, the result can be totally unpredictable.
It makes only sense on pages with a thumnail-grid layout and with the ability to link the images to Lightbox (lens templates using `<koken:link lightbox="true" ><koken:img /></koken:link>`).
- `<koken:img />` lens tags must not have a fixed preset. The plugin is expecting the *data-presets* attribute to get all avalaible sizes.
- Support for Themes other than Axis was added in V1.2.
- Since V1.3, the plugin now works on any page, as long as the DOM is structured as expected.
- Major improvements since V1.5 to support Pillar based themes (V2 Themes).

Demo
----
Check out http://daniel.mesphotos.ch to see it in action

Installation
------------
[Photoswipe](https://github.com/dimsemenov/photoswipe) files are included as static inside the *vendor* folder.
To install, execute on the server (or locally and copy to the server):
```bash
git clone https://github.com/DanielMuller/koken-plugin-photoswipe.git path/to/koken/storage/plugins/photoswipe
```

Enable plugin in Settings/Plugins.

Configuration
-------------
You can choose which sharing services are available.

You can define which DOM Elements will trigger Photoswipe. by leaving the option empty, the default element for the current Theme is used.

It advised to clear *System Caches* after inabling it.

Layout
------
By default, the default layout from Photoswipe is used:
- pswp/photoswipe.css
- pswp/default-skin/default-skin.css
- pswp/photoswipe.min.js
- pswp/photoswipe-ui-default.min.js
- pswp.min.js

You can replace any of this files, by creating a file with same name inside the `custom` folder:
- custom/photoswipe.css
- custom/default-skin/default-skin.css
- custom/photoswipe.min.js
- custom/photoswipe-ui-default.min.js
- custom/pswp.min.js

Uglifier
--------
Javascript compression can be done using uglify-js, a node.js library.
An easy way to install it under Debian/Ubuntu:
`apt-get install node-uglify`

And uglify the file by running:
`uglifyjs src/pswp.js > pswp/pswp.min.js`

Title/Caption
-------------

You can enable/disable the usage of the image title/caption in the lightbox in
the plugin setup.

The image title will be used from the `alt` image attribute.

If you want to add the caption or additional information to the image title
you've to add a html element to the template.

Simple caption:

    <koken:link lightbox="true">
      <koken:img />
      <div class="item-caption" style="display: none">{{ content.caption }}</div>
    </koken:link>

Complex caption using the timestamp and exif data:

    <koken:link lightbox="true">
      <koken:img />
      <div class="item-caption" style="display: none">
        <koken:time />
        |
        <koken:exif>
          <koken:not empty="exif.make">
            {{ exif.make }},
          </koken:not>
           <koken:not empty="exif.model">
            {{ exif.model }},
          </koken:not>
          <koken:not empty="exif.exposure">
             {{ exif.exposure }},
          </koken:not>
          <koken:not empty="exif.aperture">
            {{ exif.aperture }},
          </koken:not>
          <koken:not empty="exif.focal_length">
            {{ exif.focal_length }},
          </koken:not>
          <koken:not empty="exif.iso_speed_ratings">
            {{ exif.iso_speed_ratings }}
          </koken:not>
        </koken:exif>
      </div>
    </koken:link>


Todo
----
- Ajax/PHP calls for image details

Credits
-------
All the heavy lifting is done using [Photoswipe](http://photoswipe.com) by [Code computerlove](http://www.codecomputerlove.com/) and [Dmitry Semenov](http://dimsemenov.com/).
This plugin just integrates the relevant code into [Koken](http://koken.me/).
The version used in this plugin is [2572d...](https://github.com/dimsemenov/PhotoSwipe/tree/2572dbd4987938e9e71c64eaffd634aaf658082f)
