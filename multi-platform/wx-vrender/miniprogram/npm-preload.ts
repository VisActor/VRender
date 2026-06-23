// WeChat's npm packer does not always discover deep CommonJS imports inside
// gifuct-js. Import them explicitly so VRender's root entry can load in this
// smoke project even though the page itself does not render gif graphics.
import 'js-binary-schema-parser/lib/schemas/gif';
import 'js-binary-schema-parser/lib/parsers/uint8';
