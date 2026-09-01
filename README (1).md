# Ladybug Revolution Simulation

## Author
[Your Name]

## Purpose

Ladybug Revolution is an interactive web-based simulation that allows users to explore the motion of objects on a rotating platform. The program provides a visual simulation along with graphs that show the resulting data over time.

## Installation

No software installation is required beyond a modern web browser.

The program uses **Chart.js** for its graphs. Chart.js is loaded by the webpage, so an internet connection may be required when first opening the program if it is included through a CDN.

To install the program:

1. Download or clone this repository.
2. Keep all of the HTML, CSS, JavaScript, and image files together in the same project folder.
3. Open the project folder.

## Running the Program

Open `index.html` in a modern web browser.

No command-line arguments or additional configuration are required.

## Using the Program

The simulation can be controlled using the interface provided on the webpage:

- **Angle:** Set the platform's initial angle using the input box or slider.
- **Angular Velocity:** Set the initial angular velocity using the input box or slider.
- **Torque:** Set the applied torque using the input box or slider.
- **Play/Pause:** Start or stop the simulation.
- **Step:** Advance the simulation by a fixed time interval.
- **Reset:** Return the simulation to its initial conditions and clear the graphs.
- **Velocity:** Show or hide velocity vectors for objects on the platform.
- **Acceleration:** Show or hide acceleration vectors for objects on the platform.
- **Dragging:** Drag a ladybug to change its position on the platform.
- **Simulation tab:** View the interactive simulation.
- **Graphs tab:** View the data collected during the simulation.

## Outputs

The program produces two main types of output:

### Simulation

The simulation displays the rotating platform and the ladybugs' positions. Optional velocity and acceleration vectors can also be displayed.

### Graphs

The graphs tab displays data collected while the simulation runs:

- Platform angle versus time
- Angular velocity versus time
- Ladybug x-position versus time
- Ladybug y-position versus time
- Beetle x-position versus time
- Beetle y-position versus time

The horizontal axis represents time, while the vertical axes show the corresponding measured quantity.

## Program Flow Diagram

The following flowchart shows the main structure of the program and how user interactions connect to the simulation.

![Program Flowchart](flowchart.png)
