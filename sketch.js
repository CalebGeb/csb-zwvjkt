/* eslint-disable no-undef, no-unused-vars */

// DECLARATION OF VARIABLES
let oscType;
let modFrequency;
let pwmTxt;

let ampA, ampD, ampS, ampR;
let filtA, filtD, filtS, filtR;
let yAmpSlider, yAmpBox;
let xAmpSlider;
let choseArpNote = [];
let arpSteps = 2;
let duration = 0.25;

// CREATE OSC
let osc = new Tone.OmniOscillator("c4", "sine").start();

// CREATE AMP ENV
let ampEnv = new Tone.AmplitudeEnvelope({
  attack: 0.1,
  decay: 0.2,
  sustain: 1.0,
  release: 0.8
});

// CREATE FILTER
let filter = new Tone.Filter({
  Q: 1,
  rolloff: -12,
  type: "lowpass"
});

// CREATE FILTER ENV
let filterEnv = new Tone.FrequencyEnvelope({
  attack: 0.6,
  baseFrequency: 50,
  decay: 0.2,
  exponent: 2,
  octaves: 4.4,
  release: 2,
  sustain: 0.5
});

//ROUTING OF SIGNALS
filter.toDestination();
ampEnv.connect(filter);
osc.connect(ampEnv);

filterEnv.connect(filter.frequency);

// AUDIO KEYS
const keyboard = new AudioKeys();

// KEY PRESS
keyboard.down(function (note) {
  osc.frequency.value = note.frequency;

  ampEnv.triggerAttack();
  filterEnv.triggerAttack();

  let stepMidi = [];

  //GET MIDI VALUES
  for (let i = 0; i < choseArpNote.length; i++) {
    stepMidi.push(choseArpNote[i].value());
  }

  let stepFreq = [];

  //TURN MIDI INTO FREQUENCY
  stepMidi.forEach((value) =>
    stepFreq.push(Tone.Frequency(value, "midi").toFrequency() + note.frequency)
  );

  let segTime = duration / (stepMidi.length - 1);

  for (let j = 0; j < 50; j++) {
    // change the frequency to each note in the array
    for (let i = 1; i < stepMidi.length; i++) {
      osc.frequency.setValueAtTime(
        stepFreq[i],
        // now + 1 * lenght of the step
        Tone.now() + i * segTime + j * duration
      );

      // i - each step in the arp
      // j - how many repititions
      console.log(i, j);
    }
  }
});

// KEY RELEASE
keyboard.up(function (note) {
  ampEnv.triggerRelease();
  filterEnv.triggerRelease();
});

function setup() {
  createCanvas(675, 300);

  // OSC SELECT BOX
  oscType = createSelect();
  oscType.position(15, 45);
  oscType.option("sine");
  oscType.option("square");
  oscType.option("triangle");
  oscType.option("sawtooth");
  oscType.selected("sawtooth");
  oscType.option("pwm");

  //PWM SLIDER
  pwmText = createSpan(`MOD`);
  pwmText.position(100, 80);
  pwmText.style("font-family", "helvetica");
  pwmText.hide();

  // PWM SLIDER HIDING
  oscType.changed(() => {
    osc.type = oscType.value();

    if (oscType.value() === "pwm") {
      modFrequency.show();
      pwmText.show();
      console.log(pwmTxt);
    } else {
      mod.hide();
      pwmText.hide();
    }
  });

  // MOD
  modFrequency = createSlider(0, 5, 0.5, 0);
  modFrequency.position(15, 75);
  modFrequency.hide();
  modFrequency.style("width", "75px");

  // AMP ENV

  ampA = createSlider(0.001, 3, 0.01, 0);
  ampA.style("width", "80px");

  ampD = createSlider(0.001, 3, 0.01, 0);
  ampD.style("width", "80px");

  ampS = createSlider(0, 1, 1, 0);
  ampS.style("width", "80px");

  ampR = createSlider(0.001, 3, 0.01, 0);
  ampR.style("width", "80px");

  filtA = createSlider(0.001, 3, 0.01, 0);
  filtA.style("width", "80px");

  filtD = createSlider(0.001, 3, 0.01, 0);
  filtD.style("width", "80px");

  filtS = createSlider(0, 1, 1, 0);
  filtS.style("width", "80px");

  filtR = createSlider(0.001, 3, 0.01, 0);
  filtR.style("width", "80px");

  //create step sequence UI
  let durationPicker = createSelect();
  durationPicker.position(540, 42);
  durationPicker.option(0.25);
  durationPicker.option(0.5);
  durationPicker.option(0.75);
  durationPicker.option(1.0);

  durationPicker.changed(() => {
    duration = durationPicker.value();
  });

  let arpStepPicker = createSelect();
  arpStepPicker.position(590, 42);
  arpStepPicker.option(1);
  arpStepPicker.option(2);
  arpStepPicker.option(3);
  arpStepPicker.option(4);
  arpStepPicker.option(5);
  arpStepPicker.option(6);
  arpStepPicker.option(7);
  arpStepPicker.option(8);
  arpStepPicker.selected(2);

  //set sliders on start
  //set arp steps
  arpSteps = arpStepPicker.value();

  //delete old sliders
  let sliders = selectAll(".arp-sliders");
  sliders.forEach((slider) => slider.remove());

  //clear slider array
  choseArpNote = [];

  //create new sliders
  for (i = 0; i < arpSteps; i++) {
    choseArpNote.push(createSlider(50, 75, 60, 1));
    choseArpNote[i].position(510, 60 + i * 25);
    choseArpNote[i].class("arp-sliders");
  }

  //set sliders when changed
  //set arp steps
  arpStepPicker.changed(() => {
    arpSteps = arpStepPicker.value();

    //delete old sliders
    let sliders = selectAll(".arp-sliders");
    sliders.forEach((slider) => slider.remove());

    choseArpNote = [];

    //create new sliders
    for (i = 0; i < arpSteps; i++) {
      choseArpNote.push(createSlider(50, 75, 60, 1));
      choseArpNote[i].position(510, 60 + i * 25);
      choseArpNote[i].class("arp-sliders");
    }
  });
}

function draw() {
  background("green");
  // MOD CONNECT IF PWM
  if (oscType.value() === "pwm") {
    osc.modulationFrequency.value = modFrequency.value();
  }

  // SLIDERS TO VALUES
  ampEnv.attack = ampA.value();
  ampEnv.decay = ampD.value();
  ampEnv.sustain = ampS.value();
  ampEnv.release = ampR.value();

  filterEnv.attack = filtA.value();
  filterEnv.decay = filtD.value();
  filterEnv.sustain = filtS.value();
  filterEnv.release = filtR.value();

  // OSCILATOR BOX
  fill("red");
  rect(10, 10, 150, 150);
  fill("green");
  rect(10, 10, 150, 30);
  fill(0);
  text("Oscillator", 30, 30);

  text("Type", 120, 60);

  // ENV BOX
  yAmpBox = 0;
  fill("green");
  rect(175, 10 + yAmpBox, 150, 150);
  fill("red");
  rect(175, 10 + yAmpBox, 150, 30);
  fill(0);
  text("Amp Envelope", 200, 30 + yAmpBox);

  //ENV SLIDERS AND TEXT
  yAmpSlider = yAmpBox + 45;
  xAmpSlider = 14 + 175;
  ampA.position(xAmpSlider, yAmpSlider);
  ampD.position(xAmpSlider, yAmpSlider + 25);
  ampS.position(xAmpSlider, yAmpSlider + 50);
  ampR.position(xAmpSlider, yAmpSlider + 75);
  text(round(ampA.value(), 2), xAmpSlider + 100, yAmpSlider + 15);
  text(round(ampD.value(), 2), xAmpSlider + 100, yAmpSlider + 15 + 25);
  text(round(ampS.value(), 2), xAmpSlider + 100, yAmpSlider + 15 + 50);
  text(round(ampR.value(), 2), xAmpSlider + 100, yAmpSlider + 15 + 75);

  // FILTER BOX
  let xFilterOffset = 325;
  fill("red");
  rect(10 + xFilterOffset, 10 + yAmpBox, 150, 150);
  fill("green");
  rect(10 + xFilterOffset, 10 + yAmpBox, 150, 30);
  fill(0);
  text("Freq Envelope", 30 + xFilterOffset, 30 + yAmpBox);

  // FILTER SLIDERS
  filtA.position(14 + xFilterOffset, yAmpSlider);
  filtD.position(14 + xFilterOffset, yAmpSlider + 25);
  filtS.position(14 + xFilterOffset, yAmpSlider + 50);
  filtR.position(14 + xFilterOffset, yAmpSlider + 75);

  // FILTER SLIDER TEXT
  let xFiltLabelOffest = 450;
  text(round(filtA.value(), 2), xFiltLabelOffest, yAmpSlider + 15);
  text(round(filtD.value(), 2), xFiltLabelOffest, yAmpSlider + 15 + 25);
  text(round(filtS.value(), 2), xFiltLabelOffest, yAmpSlider + 15 + 50);
  text(round(filtR.value(), 2), xFiltLabelOffest, yAmpSlider + 15 + 75);

  //STEP SEQUENCE BOX + TEXT
  xFilterOffset = 490;
  fill("green");
  rect(10 + xFilterOffset, 10 + yAmpBox, 150, 250);
  fill("red");
  rect(10 + xFilterOffset, 10 + yAmpBox, 150, 30);
  fill(0);
  text("STEP SQUENCE", 30 + xFilterOffset, 30 + yAmpBox);
}
