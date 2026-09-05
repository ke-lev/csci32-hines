# ideas

revised direction: work with the page itself. typography, vector art, and the feeling that a signed-in user's corner belongs to them. the previous collections, lineage, colony archive, trait inspector, weekly challenges, and expanded devlog proposals are dropped. these are options to discuss, not a feature backlog.

## your intro, your card

the strongest starting point is already in the layout: the left side says something, the right side shows something. let a signed-in user author those two things on their own dashboard.

click “edit page” and the title, subhead, and short body become editable with a live preview in the site's actual typography. the right card becomes a drawing surface. save returns it to a clean page, with the editing controls tucked away. account details move behind a secondary control.

one page, one composition. a giant “go away” and a tiny waving hand could be the entire thing. or someone's name and a sprawling scribble. the point is that the existing layout gives even a very dumb drawing a good frame.

start on the user's dashboard. sharing a public page can be discussed later; there is no need to assume profiles, directories, or public posting to try the idea.

## the drawing can have a visual treatment

use the same freehand strokes and try a few ways of drawing them. these are alternatives to audition, not four tools we need to ship:

- **offset print:** a second thin copy slips a few pixels from the original, like misregistered ink. a rough doodle immediately gets a graphic quality.
- **woven ribbon:** a wider path with alternating over/under crossings. a single loop becomes a small impossible sculpture.
- **contour echo:** three or four nested echoes follow a stroke, like a topographic map. leave plenty of empty space around it.
- **wire:** the line briefly flexes behind the pen and settles when released. its final resting shape stays readable and still.

my first pick is the plain pen, then offset print: quick to judge, forgiving of messy drawing, and compatible with the site's restraint. the ribbon is a more ambitious geometry experiment. keep ordinary touch/pen input useful without hover or pressure, and offer a settled version of motion effects.

## vector art in specific places

art will work better when it responds to its location. pick one placement and see whether it earns the space:

- **a personal mark by the intro:** let the user place a small drawn signature or symbol beside their own subhead. keep it separate from the heading so the type remains legible.
- **a card-edge drawing:** on the personal drawing page, a path meets the card border and continues along it for a short distance before turning back inward. the frame becomes part of the composition while keeping its existing silhouette.
- **a button becomes its own illustration:** for one new `/buttons` experiment, pressing the pill pulls its SVG outline into a knot; release lets it untangle back into the same button. retain a stable hit area and a still reduced-motion state. the existing pupil and nuclear buttons already cover their own bits.

the existing `/cursive` route is already a type experiment, so “add handwritten headings” is not a new idea. further work there should change the actual behavior or drawing, not repeat that pitch.

## keep from the previous list: the terminal

make it a coherent way around the site. finish the route map, let `help` contain clickable destinations, and let `cat timeline/9-7` read a real post. login, signup, logout, and whoami already exist; build on them.

if the personal page lands, a command could open its editor. it should reach the same page and saved state rather than creating another customization system inside the terminal.

## keep from the previous list: suggestion receipts

give the ideas already being submitted somewhere to go: a real owner-only inbox, simple statuses, and an opaque receipt so the sender can check back. a “shipped” receipt can point to what changed. keep submission text private by default.

## where i'd start

mock up the personal intro and drawable card in the existing dashboard, with local draft state first. see whether making that one page is fun. then add persistence and choose one vector treatment. a little personal authorship feels like a clearer reason to log in than inventing more things to collect.
