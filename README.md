# hanoi
A Tower of Hanoi based sonification using the Web Audio API and the Canvas API.

This an interactive implementation of the Tower of Hanoi.
Click on towers to select the top most disc, click another tower to move the disc.
A disc may only be moved to an empty tower or to a tower with a larger disc at the top.

- Click the "Solve" button to watch an animation of the solution.
- Click the "ii V I" button to hear a fully stacked tower individually on each post in succession.
- Click the "Reset" button to reset the puzzle to its original state.

## Sonification

Each of the disks has an oscillator attached which represents a harmonic (or subharmonic) partial of the tower on which it is placed.

- The first tower is a subharmonic (undertone) series over a Bb4 (466.16 Hz) with the smallest disc as the fundamental.
- The second tower is a harmonic series over a Bb1 (58.27 Hz) with the largest disc as the fundamental.
- The third tower is a harmonic series over a (just intonated) Eb1 (~38.89 Hz) with the largest disc as the fundamental.

When played in succession this could be considered a ii-V-I progression.
