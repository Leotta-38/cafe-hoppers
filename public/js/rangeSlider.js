const sliderElem = document.querySelector('.slider')
const sliderMinInput = document.querySelector('.slider-min')
const sliderMaxInput = document.querySelector('.slider-max')

const minVal = 0
const maxVal = 5
const gap = 0.1

noUiSlider.create(sliderElem, {
  start: [ minVal, maxVal ],
  connect: true,
  step: gap,
  range: {
    'min': minVal,
    'max': maxVal
  },
  tooltips: wNumb({decimals: 1}),
  pips: {
    mode: 'values',
    values: [0, 5],
    density: 20
  }
})

sliderElem.noUiSlider.on('update', (values, handle)=> {
  if (handle === 0) {
    sliderMinInput.value = values[handle]
  } else {
    sliderMaxInput.value = values[handle]
  }
})