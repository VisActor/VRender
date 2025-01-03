---
category: examples
group: graphic-arc
title: basic-arc
keywords: arc
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/base-arc.png
---

# arc graphic

The `Arc` primitive is a basic graphic element commonly used to represent curves or arcs. In computer graphics and graphic design, the Arc primitive is used to depict a portion of a circle or any arbitrary curve, typically defined by a center point, radius, start angle, and end angle.

Key features:
- Center Point: The central position of the arc, usually a coordinate point.
- Inner Radius: The distance from the center point to any point on the inner arc, determining the size of the inner arc.
- Outer Radius: The distance from the center point to any point on the outer arc, determining the size of the outer arc.
- Start Angle and End Angle: Determine the starting and ending positions of the arc, typically expressed in degrees or radians.

## code demo

```javascript livedemo template=vrender
const graphics = [];
graphics.push(
  VRender.createArc({
    innerRadius: 0,
    outerRadius: 120,
    startAngle: 0,
    endAngle: Math.PI * 2,
    x: 200,
    y: 200,
    fill: {
      gradient: 'linear',
      x0: 0,
      y0: 0,
      x1: 1,
      y1: 0,
      stops: [
        { offset: 0, color: 'green' },
        { offset: 0.5, color: 'orange' },
        { offset: 1, color: 'red' }
      ]
    },
    fillOpacity: 0.2,
    background:
      '<svg t="1683876749384" class="icon" viewBox="0 0 1059 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5625" width="200" height="200"><path d="M928.662069 17.655172h-812.137931v208.331035h812.137931z" fill="#F1543F" p-id="5626"></path><path d="M1020.468966 275.42069l-236.579311 367.227586c0-17.655172-3.531034-35.310345-14.124138-49.434483-17.655172-24.717241-56.496552-28.248276-81.213793-45.903448-21.186207-14.124138-35.310345-42.372414-60.027586-56.496552L928.662069 17.655172l24.717241 14.124138c88.275862 49.434483 116.524138 158.896552 67.089656 243.64138M416.662069 490.813793c-21.186207 14.124138-38.841379 42.372414-60.027586 56.496552-24.717241 17.655172-63.558621 24.717241-81.213793 45.903448-10.593103 14.124138-10.593103 31.77931-14.124138 49.434483L24.717241 275.42069C-24.717241 190.675862 3.531034 81.213793 91.806897 31.77931l24.717241-14.124138 300.137931 473.158621z" fill="#FF7058" p-id="5627"></path><path d="M893.351724 656.772414c0 38.841379-35.310345 70.62069-45.903448 102.4-10.593103 35.310345-3.531034 81.213793-24.717242 109.462069-21.186207 28.248276-67.089655 35.310345-98.868965 56.496551-31.77931 28.248276-52.965517 70.62069-88.275862 81.213794-35.310345 10.593103-77.682759-10.593103-112.993104-10.593104-38.841379 0-81.213793 21.186207-116.524137 10.593104S349.572414 953.37931 317.793103 932.193103c-31.77931-21.186207-77.682759-28.248276-98.868965-56.496551-21.186207-28.248276-14.124138-74.151724-24.717241-109.462069-10.593103-35.310345-45.903448-67.089655-45.903449-102.4 0-38.841379 35.310345-70.62069 45.903449-105.931035 10.593103-35.310345 3.531034-81.213793 24.717241-109.462069 21.186207-28.248276 67.089655-35.310345 98.868965-56.496551 28.248276-21.186207 49.434483-63.558621 88.275863-74.151725 35.310345-10.593103 77.682759 10.593103 116.524137 10.593104 38.841379 0 81.213793-21.186207 112.993104-10.593104 35.310345 10.593103 56.496552 52.965517 88.275862 74.151725 31.77931 21.186207 77.682759 28.248276 98.868965 56.496551 21.186207 28.248276 14.124138 74.151724 24.717242 109.462069 10.593103 31.77931 45.903448 63.558621 45.903448 98.868966" fill="#F8B64C" p-id="5628"></path><path d="M790.951724 656.772414c0 144.772414-120.055172 264.827586-268.358621 264.827586-148.303448 0-268.358621-120.055172-268.35862-264.827586s120.055172-264.827586 268.35862-264.827586c148.303448 0 268.358621 120.055172 268.358621 264.827586" fill="#FFD15C" p-id="5629"></path><path d="M706.206897 589.682759h-123.586207c-7.062069 0-10.593103-3.531034-14.124138-10.593104L529.655172 466.096552c-3.531034-14.124138-21.186207-14.124138-28.248275 0l-38.84138 112.993103c-3.531034 7.062069-7.062069 10.593103-14.124138 10.593104H335.448276c-14.124138 0-21.186207 17.655172-7.062069 24.717241l98.868965 70.62069c3.531034 3.531034 7.062069 10.593103 3.531035 14.124138L391.944828 812.137931c-3.531034 14.124138 10.593103 24.717241 21.186206 14.124138l98.868966-70.62069c3.531034-3.531034 10.593103-3.531034 17.655172 0l98.868966 70.62069c10.593103 7.062069 24.717241-3.531034 21.186207-14.124138l-38.841379-112.993103c-3.531034-7.062069 0-10.593103 3.531034-14.124138l98.868966-70.62069c14.124138-7.062069 7.062069-24.717241-7.062069-24.717241" fill="#F8B64C" p-id="5630"></path></svg>',
    texture: 'circle',
    textureColor: 'orange',
    stroke: 'green',
    lineWidth: 2,
    cap: false
  })
);

graphics.push(
  VRender.createArc({
    innerRadius: 120,
    outerRadius: 130,
    startAngle: 0,
    endAngle: Math.PI * 2,
    x: 200,
    y: 200,
    stroke: '#63bbd0',
    lineWidth: 2,
    fill: {
      x: 0.5,
      y: 0.5,
      startAngle: 0,
      endAngle: 6.283185307179586,
      stops: [
        { offset: 0, color: '#ed2f6a' },
        { offset: 0.2, color: '#621d34' },
        { offset: 0.4, color: '#c08eaf' },
        { offset: 0.6, color: '#806d9e' },
        { offset: 0.8, color: '#2b73af' },
        { offset: 1, color: '#2f90b9' }
      ],
      gradient: 'conical'
    },
    cap: [false, true],
    cornerRadius: 26,
    forceShowCap: true
  })
);

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

graphics.forEach(g => {
  stage.defaultLayer.add(g);
});
```
