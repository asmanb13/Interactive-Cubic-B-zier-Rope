Interactive Cubic Bézier Rope Simulation

Objective

Implement an interactive cubic Bézier curve that behaves like a spring-based rope, demonstrating Bézier mathematics, tangent computation, spring-damper physics, and real-time rendering without using any prebuilt Bézier, physics, or animation libraries.

## Platform
**Web (HTML5 Canvas)**
**JavaScript (ES6)**
**Input:** Mouse and Touch


Bézier Curve

The curve is defined by four control points ( P_0, P_1, P_2, P_3 ):

[
B(t) = (1 - t)^3 P_0 + 3(1 - t)^2 t P_1 + 3(1 - t)t^2 P_2 + t^3 P_3
]

* ( P_0 ), ( P_3 ): fixed endpoints
* ( P_1 ), ( P_2 ): dynamic control points
* The curve is rendered by sampling ( t \in [0,1] ) at Δt = 0.01
  All Bézier math is manually implemented.

## Tangents

Tangents are computed using the derivative:

[
B'(t) = 3(1 - t)^2 (P_1 - P_0) + 6(1 - t)t (P_2 - P_1) + 3t^2 (P_3 - P_2)
]

Normalized tangent vectors are rendered at intervals along the curve.

## Physics Model

Dynamic control points follow a **spring-damper system**:

[
a = -k(x - x_{target}) - c v
]

This produces smooth rope-like motion with lag and settling.
Multiple stiffness presets (soft, medium, stiff) adjust ( k ) and ( c ).

## Interaction

* Mouse and touch dragging of control points
* Real-time response with smooth spring interpolation


## Rendering

Each frame:

1. Update spring physics
2. Sample Bézier points
3. Render curve, tangents, and control points

The simulation maintains ~60 FPS.

## Constraints

* No external libraries
* No built-in Bézier or physics APIs
* All math and motion logic implemented manually

## Files

```
index.html   – Canvas setup
bezier.js    – Math, physics, input, rendering
README.md    – Documentation
```
