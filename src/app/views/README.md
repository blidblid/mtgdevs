# views
Everything item in the sidenav is a view.

## Creating a view
A view is just an Angular component. To register itself as a view, that component provides itself via the `InjectionToken` `SIDE_NAV_ITEM`.
Along with the component itself, that `InjectionToken` expects metadata about the view, for example category and path.

### Layouting
Every view has a layout. Inside the layout, there are places where you can put parts of the view.

#### Top
The top should hold form items and buttons. You can think of it as a toolbar.

#### Middle
The middle is should hold the main content of the view.

#### Bottom
The bottom should hold secondary content.
