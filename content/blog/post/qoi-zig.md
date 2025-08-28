+++
title = "QOI Encoding in Zig"
author = "Gianni Rosato"
date = 2024-03-13
+++

Writing a fast and simple QOI encoder; illustrated with code examples, a spec
breakdown, and step by step implementation instructions.

<!-- more -->

_Note: the code for this project on GitHub has changed, but all of my commentary
here remains valid._

## Why?

I started writing C as my first programming language in October. While I have
other projects labelled under the programming tag on this site, a friend was the
lead developer on both, and I was just becoming familiar with Python; I never
truly learned the concepts until later, as I hadn't needed to until I took over
development for those projects. I had dabbled with Bash scripts, but other than
that, I have had very limited programming exposure until recently, though I've
had extensive exposure to technology. Becoming familiar with C quickly led me to
discover Zig in November. Around the same time, I stumbled upon the QOI (Quite
OK Image Format) lossless image format built around speed and simplicity. The
simplicity part was what caught my eye; I'm a new programmer, and writing a QOI
encoder would simultaneously allow me to get down and dirty with manipulating
data on a low level without getting into the weeds of a more complicated spec
like that of PNG.

Here's the project link, before we get too carried away:
[GitHub Link](https://github.com/gianni-rosato/qoi-enc-zig)

As soon as I got started with Zig, I already felt it was cool; Rust felt (and
continues to feel) intimidating as I was becoming acquainted with C.
"Higher-level" languages don't interest me very much.

Full disclosure: I'm not going to go through _everything_ here, and I may get
some terminology details wrong. Please reach out to correct me if you notice
anything.

## Zig

Zig is a programming language designed to be the modern replacement for C.

I won't go over every advantage Zig brings to the table over other languages,
but according to
[Zig's official site](https://ziglang.org/learn/why_zig_rust_d_cpp/), Zig has
some unique advantages over languages like C++, D, and Rust:

1. _No hidden control flow or allocations_: Zig code is explicit about function
   calls and memory allocation, so readability is improved and the programmer
   has more control.
2. _First-class support for no standard library_: Zig can be used without any
   standard library, making it friendly for bare-metal and high-performance
   development.
3. _A portable language for libraries_: Zig aims to be a new portable language
   for libraries, interacting well with C code while introducing safety and
   better language design.
4. _A package manager and build system_: Zig comes with a capable build system
   and package manager, useful even for existing C/C++ projects.
5. _Simplicity_: Zig avoids unclear features like macros and operator
   overloading found in other languages.
6. _Tooling_: Zig provides a comprehensive toolchain with cross-compilation
   (which is very cool), C/C++ support, resource compiler, and more, packaged in
   a single archive.

Zig positions itself as a simpler, more explicit, more portable language than
C++, D, and Rust while offering more powerful tooling, which is all fine and
dandy, but I'm not super familiar with Rust, D, or C++. Compared to C, Zig's
additional safety features like safety-checked undefined behavior and the
`defer` keyword to prevent issues one could normally have with `free()` in C are
what make Zig special and interesting to me. Its focus on simplicity and safety
makes it a compelling choice for systems programming tasks, including working
with multimedia codecs.

## QOI Overview

QOI is very cool because it is extremely simple while still being relatively
efficient for a lossless image codec.

> A QOI file consists of a 14-byte header, followed by any number of data
> “chunks” and an 8-byte end marker.
> ([spec](https://qoiformat.org/qoi-specification.pdf))

QOI supports two colorspaces: Linear RGB & sRGB with linear alpha. These do not
affect the way pixels are encoded. Pixels (well, "chunks" according to the spec,
but I find it more intuitive to call them pixels as that is how they are
interpreted and represented on a screen) have either three or four channels;
they are either RGB or RGBA. The QOI philosophy is that everything is
byte-aligned, making it trivial to stream bytes to a decoder one at a time and
have the decoder produce a usable output.

QOI's lossless compression takes place via six main pixel types:

0. `SPEC_NAME` ("Name I Made Up"): Description from spec. I'm only making up a
   name so I can reference it elsewhere more easily.

1. `QOI_OP_RGB` ("RGB Pixels"): Full RGB pixel value using 8 bits for each of
   the red, green, and blue channels. The alpha channel is 255 in RGB images,
   and remains unchanged from the previous pixel.

2. `QOI_OP_RGBA` ("RGBA Pixels"): Full RGBA pixel value using 8 bits for each of
   the red, green, blue, & alpha channels.

3. `QOI_OP_DIFF` ("Diff Pixels"): The difference between the current pixel and
   the previous pixel for the red, green, and blue channels are stored using 2
   bits for each channel. The differences are stored with a bias of 2 and wrap
   (so 1 minus 2 would be 255). The alpha channel remains unchanged.

4. `QOI_OP_LUMA` ("Luma Pixels"): These pixels encode the green channel
   difference from the previous pixel using 6 bits, and then encode the red and
   blue channel differences relative to the green channel difference using 4
   bits each. This allows for more efficient encoding of small color changes.
   The alpha channel remains unchanged.

5. `QOI_OP_RUN` ("Run Pixels"): These are the simplest, encoding a run-length of
   pixels that are identical to the previous pixel. The run length is stored
   using 6 bits with a bias of -1, allowing for runs of 1 to 62 pixels.

6. `QOI_OP_INDEX` ("Hashed Pixels"): These are stored by referencing a
   previously seen pixel value from a rolling array of 64 recent pixel values by
   using a simple hash on each pixel as it is identified. If another pixel
   matches a previously seen hash value in the array, the index of the
   referenced pixel is stored.

That's pretty much it! The entire spec is
[one page](https://qoiformat.org/qoi-specification.pdf) if you'd like a bit more
detail. Amazingly, QOI
[trades blows with libpng's PNG encoding while being much faster](https://qoiformat.org/benchmark/)
on average with the reference encoder given the test corpus the author used in
that benchmark.

## Explaining the Codebase

Now that I've done the requisite amount of shilling, it is time to get into the
real content. I want this to be a thorough walk-through of my decisions writing
this encoding implementation, so you can take inspiration from my work on your
own if you are also new to Zig. Again, the source code for my project can be
found at [this git repository](https://github.com/gianni-rosato/qoi-enc-zig/).

The program starts by importing the necessary standard library modules and
defining the necessary data structures. The `QoiEnum` enum, for instance,
defines the different opcodes used in the QOI format, such as `QOI_OP_RGB` and
`QOI_OP_RGBA`:

```zig
const QoiEnum = enum(u8) {
    QOI_OP_RGB = 0xFE,
    QOI_OP_RGBA = 0xFF,
    QOI_OP_INDEX = 0x00,
    QOI_OP_DIFF = 0x40,
    QOI_OP_LUMA = 0x80,
    QOI_OP_RUN = 0xC0,
};
```

These are fundamental to the QOI format's compression techniques, which we'll
explore in a bit.

Next, we have the `QoiPixel` union, which represents a single pixel's color
values. By using a union, we can access the pixel's channels (red, green, blue,
alpha) individually through the `channels` array or the `vals` struct. We can
also access them as a single unsigned 32-bit integer through
`concatenated_pixel_values`:

```zig
const QoiPixel = extern union {
    vals: extern struct {
        red: u8,
        green: u8,
        blue: u8,
        alpha: u8,
    },
    channels: [4]u8,
    concatenated_pixel_values: u32,
};
```

Important to note here is that the `extern` keyword defines the union (and the
enclosed struct) as C ABI compatible data structures. In Zig's standard unions
without the `extern` keyword, trying to access inactive fields of the union is
safety-checked undefined behavior. Your code will compile successfully, but if
you compiled in Safe mode (which you probably did by default with `zig build`)
you'll get some runtime errors accompanied by a stack trace. I enjoy the fact
that Zig allows you to use `extern union`s to essentially get different
"viewpoints" on how to access the underlying data in memory while maintaining a
different native paradigm; it is a testament to the language's ability to
espouse flexibility while still providing a feeling of familiarity.

The `QoiDesc` struct holds essential information about the image being encoded,
including its dimensions, color channels, and colorspace, in order to write the
header for the encoded file. This struct provides methods for assigning our
instance of `QoiDesc` & writing the QOI header to the output file:

```zig
const QoiDesc = struct {
    width: u32 = 0,
    height: u32 = 0,
    channels: u8 = 0,
    colorspace: u8 = 0,

    fn qoiSetEverything(w: u32, h: u32, ch: u8, c: u8) QoiDesc {
        return QoiDesc{ .width = w, .height = h, .channels = ch, .colorspace = c };
    }

    fn writeQoiHeader(self: QoiDesc, dest: *[14]u8) void {
        // ... (implementation omitted for brevity)
    }
};
```

Struct methods in Zig are not super different from normal functions. According
to Zig's website:

> Struct methods are not special, they are only namespaced functions that you
> can call with dot syntax.
> ([1](https://ziglang.org/documentation/master/#struct))

Using these within the scope of struct definitions is cool because it makes the
codebase nice and neat. You can also call methods with dot syntax, which feels
tidy:

```zig
// Declare variable `desc` providing width, height, channels, colorspace.
// We can call this method using dot syntax on the type:
    var desc = QoiDesc.qoiSetEverything(width, height, channels, colorspace);
// Now, we use dot syntax on the `desc` variable to call the
// `writeQoiHeader` method, where `desc` is passed to the method as `self`:
    desc.writeQoiHeader(qoi_file[0..14]);
```

You don't need to do `foo->bar` like in C, either; Zig will do that
automatically if you just do `foo.bar`. I like this!

The `QoiEnc` struct encapsulates the encoding logic. It maintains a pixel
buffer, a run counter, and various other state variables necessary for the
encoding process. The `qoiEncInit` method initializes the encoder with the image
description & an output buffer:

```zig
const QoiEnc = struct {
    buffer: [64]QoiPixel,
    prev_pixel: QoiPixel,

    pixel_offset: usize,
    len: usize,

    data: [*]u8,
    offset: [*]u8,

    run: u8,
    pad: u24,

    fn qoiEncInit(self: *QoiEnc, desc: QoiDesc, data: [*]u8) !void {
        // ... (implementation omitted for brevity)
    }

    // ... (other methods omitted for brevity, but there are a bunch)
};
```

Now, remember the types of pixels allowed in QOI that we enumerated earlier? The
`QoiEnc` struct provides separate methods for encoding each of these, including
`qoiEncRun`, `qoiEncLuma`, `qoiEncIndex`, `qoiEncFullColor`, and
`qoiEncDifference`.

Let's take a closer look at the `qoiEncRun` method, which handles run-length
encoding:

```zig
fn qoiEncRun(self: *QoiEnc) void {
    const tag: u8 = @intFromEnum(QoiEnum.QOI_OP_RUN) | (self.run - 1);
    self.run = 0;

    self.offset[0] = tag;
    self.offset += 1;
}
```

This is a _"Run pixel"_ which is the simplest kind of pixel conceptually within
QOI, in my opinion.

This method writes a tag byte to the output buffer, indicating a run of
identical pixels. The tag byte consists of the `QOI_OP_RUN` opcode combined with
the run length minus one via a logical or.

The `qoiEncLuma` method, on the other hand, handles encoding _"Luma Pixels"_:

```zig
fn qoiEncLuma(self: *QoiEnc, green_diff: i8, dr_dg: i8, db_dg: i8) void {
    const green_diff_biased: u8 = @intCast(green_diff + 32);
    const dr_dg_biased: u8 = @intCast(dr_dg + 8);
    const db_dg_biased: u8 = @intCast(db_dg + 8);

    const tags = [2]u8{ @intFromEnum(QoiEnum.QOI_OP_LUMA) | green_diff_biased, dr_dg_biased << 4 | db_dg_biased };

    for (tags, 0..) |tag, i| self.offset[i] = tag;
    self.offset += tags.len;
}
```

This method calculates the differences between the red, green, and blue channels
of the current pixel and the previous pixel. It then encodes these differences
using a luma tag and bias values, as we already explained when we talked about
QOI.

Encoding "Diff Pixels" with `qoiEncDifference` is a similar story:

```zig
    fn qoiEncDifference(enc: *QoiEnc, red_diff: i32, green_diff: i32, blue_diff: i32) void {
        const green_diff_biased: u8 = @intCast(green_diff + 2);
        const red_diff_biased: u8 = @intCast(red_diff + 2);
        const blue_diff_biased: u8 = @intCast(blue_diff + 2);

        const tag: u8 =
            @intFromEnum(QoiEnum.QOI_OP_DIFF) |
            red_diff_biased << 4 |
            green_diff_biased << 2 |
            blue_diff_biased;

        enc.offset[0] = tag;

        enc.offset += 1;
    }
```

The bit manipulations for properly writing to `enc.offset` felt a bit
intimidating, and to be honest, they still do & probably always will. Thinking
about the actual structure of the pixels being written to the file, it begins to
make a bit more sense thinking about the fact that the pixels are stored in
order of red's difference, then green's difference, then blue's difference, with
a tag preceding them; the entire pixel is a single byte, the differences are
just being ordered _within_ that byte.

Now, let's look at encoding "RGB Pixels" & "RGBA Pixels" with `qoiEncFullColor`:

```zig
    fn qoiEncFullColor(enc: *QoiEnc, px: QoiPixel, channels: u8) void {
        var s: u3 = 0;
        if (channels > 3) s = 5 else s = 4;
        const tags: [5]u8 = if (channels > 3) .{
            @intFromEnum(QoiEnum.QOI_OP_RGBA),
            px.vals.red,
            px.vals.green,
            px.vals.blue,
            px.vals.alpha,
        } else .{
            @intFromEnum(QoiEnum.QOI_OP_RGB),
            px.vals.red,
            px.vals.green,
            px.vals.blue,
            undefined,
        };

        for (tags[0..s], 0..s) |tag, i| enc.offset[i] = tag;
        enc.offset += s;
    }
```

Here, we have some trademark "Zigginess". Let's walk through it:

- The method takes a pointer to a QoiEnc, which is essentially "self"
- A QoiPixel, and
- the number of channels. Within the method:
- We declare a variable `s` which is a mere 3 bits
- We're making `tags` an array of 5 unsigned 8-bit integers, and assigning
  different values to the array depending on the number of channels.

Let's stop here for a moment. As you can see, these `if` expressions are being
used more like ternary expressions would be in C. The assignment to `tags` is
being done via an _anonymous list literal_. These confused me greatly when first
learning Zig, but it makes a bit more sense looking at a more concise example:

```zig
// Initialize an array with array literal syntax. Compiler infers size
    const arr_a = [_]i6{6, 7, 8};
// Initialize an array with an anonymous list literal. Compiler cannot
// infer size, as it isn't aware of the anonymous list literal
    const arr_b: [3]i6 = .{6, 7, 8};
```

Now we can observe the `for` loop at the end of the function block. I like the
way Zig handles for loops, essentially leaving traditional C-style `i++`
iteration for `while` loops. What we're essentially doing in this loop is
slicing `tags` from index 0 to the index before `s`.

> A slice is a pointer and a length. The difference between an array and a slice
> is that the array's length is part of the type and known at compile-time,
> whereas the slice's length is known at runtime. Both can be accessed with the
> `len` field. ([2](https://ziglang.org/documentation/master/#Slices))

We're also keeping track of 0 through the integer just preceding `s` with
`0..s`. The values are captured with `|tag, i|`, where we use `i` to assign
values with `tag` to elements in `enc.offset`. Finally, we add `s` to
`enc.offset`, as `s` represents the number of bytes we need, and `enc.offset` is
a u8 multi-pointer.

This felt pretty cool, to have `for` loops and `if` statements so gracefully
doing my bidding based on little `s`.

How about we take a look at encoding "Hashed Pixels" next, now that we're
getting the hang of things?

```zig
fn qoiEncIndex(enc: *QoiEnc, index_pos: u8) void {
    const tag: u8 = @intFromEnum(QoiEnum.QOI_OP_INDEX) | index_pos;
    enc.offset[0] = tag;
    enc.offset += 1;
}
```

This is pretty straightforward. We calculate the hash itself outside of the
function with
`const index_pos: u6 = @truncate(cur_pixel.vals.red *% 3 +% cur_pixel.vals.green *% 5 +% cur_pixel.vals.blue *% 7 +% cur_pixel.vals.alpha *% 11);`.
The `*%` & `+%` just mean _wrapping addition/multiplication_, which we
understand from the QOI pixel descriptions. We need our numbers to wrap around.
The built-in `@truncate` helps too, as it ensures we don't overflow a `u6`; it
truncates bits from an integer type resulting in a smaller integer type, so it
is taking the low 6 bits of our hash result because there are only 64 entries in
our index table. The `enc.offset` is incremented by 1, because the pixel is a
single byte.

That's all the pixels!

Now, the `qoiEncodeChunk` function is where the magic happens. It iterates over
the input pixel data, compares each pixel with the previous one, and chooses the
optimal encoding operation based on the differences between the pixels. The
encoded data is then written to the output buffer using the respective encoding
methods:

```zig
fn qoiEncodeChunk(desc: *QoiDesc, enc: *QoiEnc, qoi_pixel_bytes: [*]u8) void {
    var cur_pixel: QoiPixel = undefined;

    // ... (omitted for brevity. this is just deciding "alpha or no alpha?"
    // and writing relevant data to the current pixel.)

    const index_pos: u6 = @truncate(cur_pixel.vals.red *% 3 +% cur_pixel.vals.green *% 5 +% cur_pixel.vals.blue *% 7 +% cur_pixel.vals.alpha *% 11);

    if (qoiComparePixel(cur_pixel, enc.prev_pixel, desc.channels)) {
        // Handle "run pixel" encoding
        // ...
    } else {
        if (enc.run > 0) {
            enc.qoiEncRun();
        }
        if (qoiComparePixel(enc.buffer[index_pos], cur_pixel, 4)) {
            // Handle "hash pixel" encoding
            // ...
        } else {
            enc.buffer[index_pos] = cur_pixel;

            // Handle various encoding operations based on pixel differences
            // ...
        }
    }

    enc.prev_pixel = cur_pixel;
    enc.pixel_offset += 1;

    // Handle padding at the end of the image once it is time to do so
    // ...
}
```

You can see the `index_pos` hash calculation in there, where it happens, and
what triggers it. Hopefully, everything else is clear, too. Alongside the
others, this function demonstrates Zig's ability to work with low-level data
structures and perform bit-level operations.

## Main Function

Now that we understand everything we can do to encode a QOI image, let's look at
the `main` function.

This `main` function serves as a great example of Zig's clean and readable
syntax as well as QOI's simplicity. It parses command-line arguments, handles
file I/O, and orchestrates the encoding process while staying concise. Error
handling is easy in Zig, with the error union `!void` ensuring any errors are
dealt with as they are returned. I'd like to expand on error unions more, but
I'll save that for another article.

```zig
pub fn main() !void {
    // Get allocator
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    defer _ = gpa.deinit();

    // Parse args into string array (error union needs 'try')
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    if (std.mem.eql(u8, args[1], "-h") or
        std.mem.eql(u8, args[1], "--help") or
        args.len < 4 or
        args.len > 4 or
        args[1].len < 1)
    {
        _ = try printHelp();
        return;
    }

    var width: u32 = undefined;
    var height: u32 = undefined;
    var channels: u8 = undefined;
    const colorspace: u8 = try parseInt(u8, args[3], 10);

    print("Opening {s} ... ", .{args[1]});

    const file = try std.fs.cwd().openFile(args[1], .{ .mode = .read_only });
    defer file.close();

    const bytes_read = try file.readToEndAlloc(allocator, std.math.maxInt(usize));
    defer allocator.free(bytes_read);
    var offset: usize = 0;

    if (std.mem.eql(u8, bytes_read[0..2], "P7")) {
        print("file is a PAM\n", .{});
        offset = try parsePamHeader(bytes_read[0..72], &width, &height, &channels);
    } else {
        print("\n\x1b[31mInvalid Input: Input file does not appear to be a compatible PAM.\x1b[0m\n", .{});
        print("If your PAM input contains comments in the header, please strip them.\n", .{});
        return error.InvalidInput;
    }

    const image_size: usize = width * height * channels;
    if (image_size > bytes_read.len - offset) {
        print("\x1b[31mInvalid Input: Image size is larger than the file size.\x1b[0m\n", .{});
        return error.InvalidInput;
    }

    var desc = QoiDesc.qoiSetEverything(width, height, channels, colorspace);

    const qoi_file_size = @as(usize, desc.width) * @as(usize, desc.height) * (@as(usize, desc.channels) + 1) + 14 + 8 + @sizeOf(usize);
    var qoi_file = try allocator.alloc(u8, qoi_file_size);
    defer allocator.free(qoi_file);

    print("Writing {s} ... ", .{args[2]});

    desc.writeQoiHeader(qoi_file[0..14]);

    var pixel_seek: [*]u8 = bytes_read[offset..].ptr;
    var enc: QoiEnc = undefined;

    try enc.qoiEncInit(desc, qoi_file.ptr);

    while (!(enc.pixel_offset >= enc.len)) {
        qoiEncodeChunk(&desc, &enc, pixel_seek);
        pixel_seek += desc.channels;
    }

    const used_len = @intFromPtr(enc.offset) - @intFromPtr(enc.data);

    const outfile = try std.fs.cwd().createFile(args[2], .{ .truncate = true });
    defer outfile.close();
    _ = try outfile.writeAll(enc.data[0..used_len]);
    print("\x1b[32mSuccess!\x1b[0m\n\tOriginal:\t{d} bytes\n\tCompressed:\t{d} bytes ", .{ image_size + offset, used_len });
    if ((image_size + offset) > used_len) {
        const used_len_flt: f64 = @floatFromInt(used_len);
        const image_size_flt: f64 = @floatFromInt(image_size + offset);
        const percent_dec: f64 = 100.0 - ((used_len_flt / image_size_flt) * 100.0);
        print("(\x1b[33m{d:.2}%\x1b[0m smaller)\n", .{percent_dec});
    } else {
        print("\n", .{});
    }
}
```

That's it, the entire `main` function. It could probably be made even more
concise with some code golfing, but for now, I'm happy with how readable it is
even without comments.

Coming from any other low-level language background, I think this function is
relatively easy to parse. This is a big argument for Zig, in my opinion -
transitioning C projects is not a massive burden if you have interoperability as
well as a codebase that feels familiar to long-time C developers. Even as a
relatively inexperienced C developer, Zig was trivial to pick up.

## Conclusion

Exploring QOI encoding in Zig has been an incredibly rewarding ordeal. Not only
did this experience allow me to dive into the intricacies of simple lossless
image compression, but it also showcased to me the power and versatility of Zig.

Full disclosure, I may have gotten some details incorrect here, so corrections
may be imminent. I'll add a note to the very top of this page if I make any
larger corrections to the article.

If you're a programmer seeking a modern systems programming language, I highly
recommend giving Zig a try. If you have any questions, comments, or concerns,
feel free to reach out to me via my socials on this site's homepage. Thanks for
reading!

_Thank you to Cancername for their help with the QOI encoding implementation!_

Freestanding QOI Encoder in Zig:
[GitHub Link](https://github.com/gianni-rosato/qoi-enc-zig) (no code comments
yet, coming soon).
