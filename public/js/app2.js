const photoBtnAll = document.querySelectorAll('.photo-btn')
const cafePhoto = document.querySelector('.cafe-photo')

for (let photoBtn of photoBtnAll) {
  photoBtn.addEventListener('click', () => {
    cafePhoto.style.display = 'none'
    let href = event.target.getAttribute('href')
    cafePhoto.setAttribute('src', `${href}`)
    cafePhoto.style.display = 'block'
  })
}
