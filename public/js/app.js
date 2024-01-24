const ratingInput = document.querySelector('.rating-input')
const ratingValue = document.querySelector('.rating-value')

ratingInput.addEventListener('input', () => {
  ratingValue.textContent = ratingInput.value
})

window.onload = () => {
  ratingValue.textContent = ratingInput.value
}