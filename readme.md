A collection of self-contained custom elements that do somewhat complex things
inside a website.

## TypeWriter

```html
<type-writer
    wait=1
    type=0.1
    back=0.06
>
    <span>Some text to type</span>
</type-writer>
```

Control attributes:

- `wait`: Time in seconds to wait after typing out the text before erasing.
- `type`: The time in seconds between typing each character.
- `back`: The time in seconds between erasing each character.

```html
<type-writer>
    <span>Markup is <b>supported</b></span>
</type-writer>
```

Contents aren't typed out as HTML but as text, with nested DOM-nodes being
created as needed. In other words, you can put more complex HTML inside of the
type-writer items and it'll "just work". This hasn't been tested with any
super-crazy layouts though.

```html
<type-writer>
    <span>Cool</span>,
    <span>Great</span> and
    <span>Awesome</span>
</type-writer>
```

top-level text tags inside the type-writer light DOM are ignored, so you
can put some text in between as a fallback. In the example above, if the
TypeWriter element fails somehow, the user will see a comma-separted list of
items.

```html
<type-writer>
    <span>Cool</span>
    <template>Great</template>
    <template>Awesome</template>
</type-writer>
```

You can also put your content into templates, so in case the component can't be
loaded, the user will just see the first item as static text.

## ImageCarousel

A simple image carousel that scrolls through a list of images, then scrolls back
to the start.

<image-carousel interval="3000">
  <img src="https://picsum.photos/1920/1080?random&1">
  <img src="https://picsum.photos/1020/1080?random&2">
  <img src="https://picsum.photos/1220/680?random&3">
</image-carousel>
