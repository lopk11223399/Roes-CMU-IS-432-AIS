const client = contentful.createClient({
	// This is the space ID. A space is like a project folder in Contentful terms
	space: 'zbeeszdq743p',
	// This is the access token for this space. Normally you get both ID and the token in the Contentful web app
	accessToken: 'q8cv7tD0-nNAlH2lz45ivu8U18K9yClKhTtCWBUhLM0',
})

// variables
const productsDOM = document.querySelector('.product')
const categorysDOM = document.querySelector('.category__list')
const timeToday = document.querySelector('.header__title--time')
const divider = document.querySelector('.category .divider')
const inputSearch = document.querySelector('.header__search--text')
const subTotal = document.querySelector('.cart__total--list')
const cartList = document.getElementById('cart__list')
const orverlay = document.querySelector('.overlay__show')
const bill = document.querySelector('.bill')
const continuePayment = document.querySelector('.content--btn')
const backBill = document.querySelector('.confirmation__back')
const cartPayment = document.getElementById('cart__payment')
const totalPayment = document.querySelector('.total__subTotal--payment')
const orderType = document.querySelector('.type__order--select-value')
const orderTypeList = document.querySelectorAll('.type__order--select-item')
const selectType = document.querySelector('.form__select')
const paymentType = document.querySelectorAll('.form__select--item')
const addItemInPayment = document.querySelector('.confirmation__header--btn')
const cancelBill = document.querySelector('.confirmation__btn--back')
const submitBill = document.querySelector('.confirmation__btn--conf')
const randomOrder = document.querySelector('.content--random')
const randomBill = document.querySelector('.title__random')

// Date
const months = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
]

const weekdays = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
]

// cart
let cart = []

// getting the products
class Products {
	async getProducts() {
		try {
			let contentful = await client.getEntries({
				content_type: 'products',
			})

			// let result = await fetch('product.json')
			// let data = await result.json()
			// let products = data.items

			let products = contentful.items
			products = products.map(item => {
				const { title, price, category } = item.fields
				const { id } = item.sys
				const image = item.fields.image.fields.file.url
				return { title, price, category, id, image }
			})
			return products
		} catch (error) {
			console.log(error)
		}
	}

	async getUser() {
		try {
			let contentful = await client.getEntries({
				content_type: 'user',
			})

			let users = contentful.items
			users = users.map(item => {
				const { fullname } = item.fields
				return { fullname }
			})
			return users
		} catch (error) {
			console.log(error)
		}
	}

	async checkUser() {
		const params = new URLSearchParams(window.location.search)

		params.forEach(value => {
			user = value
		})
	}
}

class UI {
	// display products
	displayProducts(products) {
		let result = ''
		products.forEach(product => {
			let { title, price, id, image } = product
			result += `
            <!-- product -->
            <div class="product__item">
                <img class="product__item--img" src=${image} alt=${title}>
                <h3 class="product__item--name">${title}</h3>
                <p class="product__item--price">$ ${price}</p>
                <button class="product__item--btn btn" data-id="${id}">order</button>
            </div>
            <!-- end of product -->
            `
		})
		productsDOM.innerHTML = result
	}

	// display category
	displayCategory(products, curentIndex = 0) {
		const categorys = products.reduce(
			(values, item) => {
				if (!values.includes(item.category)) {
					values.push(item.category)
				}
				return values
			},
			['All'],
		)

		let result = ''
		categorys.forEach((category, index) => {
			result += `
            <p class="category__list--item ${
							index === curentIndex ? 'category__active' : ''
						}">${category}</p>
            `
		})
		categorysDOM.innerHTML = result
	}

	// render Time today
	displayTime() {
		// render time after 1s
		setInterval(this.getTime, 1000)
	}

	// Get Time
	getTime() {
		let today = new Date()
		let year = today.getFullYear()
		let month = today.getMonth()
		month = months[month]
		let date = today.getDate()
		let weekday = weekdays[today.getDay()]
		let hours = today.getHours()
		let minutes = today.getMinutes()
		let seconds = today.getSeconds()
		let day = 'AM'

		if (hours > 12) {
			day = 'PM'
		}

		if (seconds < 10) {
			seconds = '0' + seconds
		}

		if (minutes < 10) {
			minutes = '0' + minutes
		}

		if (hours < 10) {
			hours = '0' + hours
		}

		timeToday.textContent = `${weekday}, ${date} ${month} ${year} - ${hours}:${minutes}:${seconds} ${day}`

		// get date add to bill
		return {
			day: `${date}/${month}/${year}`,
			time: `${hours}:${minutes}:${seconds}`,
		}
	}

	// Get product when click to category
	getProductFormCategory() {
		const categoryBtn = document.querySelectorAll('.category__list--item')
		categoryBtn.forEach(btn =>
			btn.addEventListener('click', e => {
				let products = [...Storage.getProducts()]
				const category = e.target.innerText
				const categoryCheck = products.filter(function (value) {
					if (value.category === category) {
						return value
					}
				})

				if (category === 'All') {
					this.displayProducts(products)
					this.getBtnOrder()
				} else {
					this.displayProducts(categoryCheck)
					this.getBtnOrder()
				}
			}),
		)
	}

	// handle divider when click to category
	handleDivider() {
		const categoryBtn = document.querySelectorAll('.category__list--item')
		const categorActive = document.querySelector(
			'.category__list--item.category__active',
		)
		divider.style.left = categorActive.offsetLeft + 'px'

		categoryBtn.forEach(btn =>
			btn.addEventListener('click', () => {
				document
					.querySelector('.category__list--item.category__active')
					.classList.remove('category__active')
				divider.style.left = btn.offsetLeft + 'px'
				btn.classList.add('category__active')
			}),
		)

		// call get product when click to category
		this.getProductFormCategory()
	}

	// search product
	inputSearchProduct() {
		inputSearch.addEventListener('keyup', () => {
			const value = inputSearch.value
			// console.log(value)
			let products = [...Storage.getProducts()]
			let filteredProducts = products.filter(product => {
				return product.title.toLowerCase().includes(value)
			})

			if (filteredProducts.length < 1) {
				productsDOM.innerHTML = `<h2 class="product__note">Sorry, no products matched your search</h2>`
				return
			} else {
				// call render item after search
				this.displayProducts(filteredProducts)
				// call handle click order
				this.getBtnOrder()
				// call render category after search
				this.displayCategory(products)
				// call handle divider
				this.handleDivider()
			}
		})
	}

	// handle click order add to cart
	getBtnOrder() {
		const orderBtns = [...document.querySelectorAll('.product__item--btn')]
		cart = Storage.getCart()
		// console.log(orderBtns.length)
		orderBtns.forEach(orderBtn => {
			orderBtn.addEventListener('click', e => {
				let id = e.target.dataset.id
				let check = cart.find(x => x.id === id)
				if (check === undefined) {
					cart.push({
						...Storage.getProductId(id),
						amount: 1,
					})
				} else {
					check.amount += 1
				}
				// save cart in local storage
				Storage.saveCart(cart)
				// set cart values
				this.setTotal(cart)
				// display cart item
				this.addCartItem(cart)
			})
		})
	}

	// render total
	setTotal(cart) {
		let tempTotal = 0

		if (Array.isArray(cart)) {
			cart.map(item => {
				tempTotal += item.price * item.amount
			})
		}

		if (cart === undefined) {
			subTotal.innerText = '$ 0'
			totalPayment.innerText = '$ 0'
		} else {
			subTotal.innerText = `$ ${parseFloat(tempTotal.toFixed(2))}`
			totalPayment.innerText = `$ ${parseFloat(tempTotal.toFixed(2))}`
		}
	}

	// logic after add item to cart
	addCartItem(items) {
		cartList.innerHTML = this.getCartItems(items)
		this.removeItemCart()
		this.inputCartItemNumber()
		this.inputCartItemNote()
		this.payment()
		// set up total
		this.setTotal(items)
	}

	// render item after click order
	getCartItems(items) {
		let result = ''
		if (Array.isArray(items)) {
			items.forEach(item => {
				let { title, price, id, image, amount, note } = item
				result += `
                <div class="cart__item" data-id=${id}>
                    <div class="cart__item--top">
                        <div class="cart__name">
                            <div class="cart__name--left">
                                <img class="cart__img" src=${image} alt=${title}>
                                <div class="cart__desc">
                                    <p class="cart__desc--name">${title}</p>
                                    <p class="cart__desc--price">$ ${price}</p>
                                </div>
                            </div>
                            <input type="number" class="cart__input" value="${amount}">
                        </div>
                        <p class="cart--total">$${(price * amount).toFixed(
													2,
												)}</p>
                    </div>
                    <div class="cart__item--bottom">
                        <input class="cart__bottom--input" type="text" placeholder="Order Note..." value="${
													note === undefined ? '' : note
												}" data-id=${id}>
                        <div class="cart__bottom--trash" data-id=${id}>
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M18.8789 8.71882L18.9784 8.72017C19.3475 8.75069 19.6304 9.05716 19.65 9.42605L19.6405 9.63174L19.326 13.483L18.9961 17.2414C18.9263 17.9917 18.8638 18.6245 18.8099 19.1227C18.6225 20.8588 17.4955 21.9323 15.7966 21.9641C13.1494 22.013 10.6048 22.0125 8.13373 21.9591C6.48398 21.9244 5.37366 20.8393 5.18955 19.1297L5.0623 17.8702L4.83994 15.427L4.61216 12.7461L4.35172 9.52788C4.31935 9.11498 4.61951 8.75335 5.02215 8.72016C5.39123 8.68973 5.7183 8.94584 5.79519 9.30677L5.82511 9.60173L6.06966 12.6187L6.33669 15.7459C6.45646 17.0996 6.56034 18.1952 6.64346 18.9648C6.74838 19.939 7.26138 20.4404 8.16411 20.4593C10.6159 20.5124 13.1415 20.5129 15.7701 20.4643C16.7277 20.4464 17.2488 19.9499 17.356 18.9574L17.4827 17.7046C17.5198 17.3185 17.5594 16.8923 17.6013 16.4293L17.8686 13.3538L18.1906 9.4075C18.2204 9.02902 18.5192 8.7389 18.8789 8.71882ZM3.73139 6.98918C3.32745 6.98918 3 6.65338 3 6.23916C3 5.85945 3.27515 5.54564 3.63214 5.49597L3.73139 5.48913H6.91772C7.29636 5.48913 7.62785 5.23928 7.74642 4.87929L7.77543 4.76813L8.02304 3.50533C8.24111 2.66897 8.9492 2.07349 9.779 2.00633L9.93592 2H14.0639C14.9075 2 15.6523 2.54628 15.9391 3.39039L15.9874 3.55209L16.2243 4.76783C16.2987 5.14872 16.6025 5.4332 16.9701 5.48177L17.0821 5.48913H20.2686C20.6725 5.48913 21 5.82493 21 6.23916C21 6.61887 20.7248 6.93267 20.3679 6.98234L20.2686 6.98918H3.73139ZM14.0639 3.50006H9.93592C9.7307 3.50006 9.54829 3.62322 9.47252 3.77803L9.44682 3.84604L9.20979 5.06238C9.1808 5.21084 9.13879 5.3538 9.08512 5.49012L14.9148 5.49031C14.8813 5.40526 14.8523 5.31763 14.8282 5.22768L14.79 5.06208L14.5636 3.8928C14.5107 3.68991 14.3473 3.54138 14.1502 3.50742L14.0639 3.50006Z" />
                            </svg>
                        </div>
                    </div>
                </div>
                `
			})
		}
		return result
	}

	// handle click trash to remove item in cart
	removeItemCart() {
		const trashBtns = cartList.querySelectorAll('.cart__bottom--trash')
		trashBtns.forEach(e => {
			e.addEventListener('click', event => {
				let item = event.target
				let id = item.dataset.id
				this.getItemRemove(id)
				cartList.removeChild(item.parentElement.parentElement)
			})
		})
	}

	// get item to remove
	getItemRemove(id) {
		cart = cart.filter(item => item.id !== id)
		Storage.saveCart(cart)
		this.setTotal(cart)
	}

	// handle change input number amount item
	inputCartItemNumber() {
		const inputValues = cartList.querySelectorAll('.cart__input')
		inputValues.forEach(e => {
			e.addEventListener('change', event => {
				let target = event.target
				let value = parseInt(target.value)
				let item = target.parentElement.parentElement.parentElement
				let itemId = item.dataset.id
				this.getInputCartItemNumber(itemId, value)
			})
		})
	}

	// get amount item to change
	getInputCartItemNumber(itemId, value) {
		cart.forEach(vaule => {
			if (vaule.id === itemId) {
				if (value <= 0 || isNaN(value)) {
					vaule.amount = 1
				} else {
					vaule.amount = value
				}
			}
		})
		Storage.saveCart(cart)
		this.renderCartPayment(cart)
		this.addCartItem(cart)
		this.setTotal(cart)
	}

	// handle change input note item
	inputCartItemNote() {
		const noteItem = cartList.querySelectorAll('.cart__bottom--input')
		noteItem.forEach(e => {
			e.addEventListener('change', event => {
				let target = event.target
				let value = target.value
				let itemId = target.dataset.id
				this.getInputCartItemNote(value, itemId)
			})
		})
	}

	// get item add note to cart
	getInputCartItemNote(value, itemId) {
		cart.forEach(vaule => {
			if (vaule.id === itemId) {
				vaule.note = value
			}
		})
		Storage.saveCart(cart)
		this.addCartItem(cart)
		this.renderCartPayment(cart)
	}

	// show Bill
	showBill() {
		orverlay.classList.remove('overlay__hide')
		bill.classList.remove('bill__hide')
	}

	// hide Bill
	hideBill() {
		orverlay.classList.add('overlay__hide')
		bill.classList.add('bill__hide')
	}

	// hande click back to close bill
	backBill() {
		backBill.addEventListener('click', () => {
			this.hideBill()
		})
	}

	// hande click show bill and render products in cart to bill
	payment() {
		continuePayment.addEventListener('click', () => {
			this.showBill()
			cart = Storage.getCart()
			this.renderCartPayment(cart)
		})
	}

	// render item in cart to bill
	renderCartPayment(item) {
		cartPayment.innerHTML = this.getCartItems(item)
		this.setTotal(item)
	}

	// Logic item in bill
	paymentLogic() {
		cartPayment.addEventListener('click', e => {
			if (e.target.classList.contains('cart__bottom--trash')) {
				let item = e.target
				let id = item.dataset.id
				this.getItemRemove(id)
				cartPayment.removeChild(item.parentElement.parentElement)
				this.addCartItem(cart)
			}
		})
		cartPayment.addEventListener('change', e => {
			if (e.target.classList.contains('cart__input')) {
				let target = e.target
				let value = parseInt(target.value)
				let item = target.parentElement.parentElement.parentElement
				let itemId = item.dataset.id
				this.getInputCartItemNumber(itemId, value)
			} else if (e.target.classList.contains('cart__bottom--input')) {
				let target = e.target
				let value = target.value
				let itemId = target.dataset.id
				this.getInputCartItemNote(value, itemId)
			}
		})
	}

	// chose type in bill payment
	getTypeOrder() {
		orderTypeList.forEach(e => {
			e.addEventListener('click', event => {
				const item = event.target.textContent
				orderType.innerHTML = item
			})
		})
	}

	// chose type payment
	getPaymentType() {
		selectType.addEventListener('click', e => {
			paymentType.forEach(btn => {
				if (e.target.classList.contains('form__select--item')) {
					btn.classList.remove('form__select--active')
					e.target.classList.add('form__select--active')
				}
			})
		})
	}

	// handle add item adter show bill
	addItemInPayment() {
		addItemInPayment.addEventListener('click', () => {
			this.hideBill()
		})
	}

	// handle delete item after show bill
	cancelBill() {
		cancelBill.addEventListener('click', () => {
			this.hideBill()
		})
	}

	// handle item after sumbit success bill
	submitBill() {
		submitBill.addEventListener('click', () => {
			Storage.clearCart(cart)
			cart = []
			this.addCartItem(cart)
			this.renderCartPayment(cart)
			this.setTotal(cart)
			this.hideBill()
			this.randombill()
		})
	}

	// random number bill
	randombill() {
		let random = Math.floor(Math.random() * 100000)
		randomOrder.innerHTML = `Orders #${random}`
		randomBill.innerHTML = `Orders #${random}`
	}

	// set up App after open web
	setupApp() {
		cart = Storage.clear()
		// cart = Storage.getCart()
		this.addCartItem(cart)
		this.setTotal(cart)
		this.backBill()
		this.payment()
		this.addItemInPayment()
		this.cancelBill()
		this.randombill()
	}
}
// local storage
class Storage {
	// save data form database add to local storage
	static saveProducts(products) {
		localStorage.setItem('products', JSON.stringify(products))
	}

	// get data form local storage
	static getProducts() {
		let products = JSON.parse(localStorage.getItem('products'))
		return products
	}

	// get data.id form local storage
	static getProductId(id) {
		let products = JSON.parse(localStorage.getItem('products'))
		return products.find(product => product.id === id)
	}

	// save cart to local storage
	static saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart))
	}

	// get cart to local storage
	static getCart() {
		return localStorage.getItem('cart')
			? JSON.parse(localStorage.getItem('cart'))
			: []
	}

	// remove cart to local storage
	static clearCart() {
		localStorage.removeItem('cart')
	}

	// delete all data to local storage
	static clear() {
		localStorage.clear()
	}

	// save user form page login add to local storage
	static saveUser(value) {
		localStorage.setItem('user', JSON.stringify(value))
	}

	// get name user form local storage
	static getUser() {
		let products = JSON.parse(localStorage.getItem('user'))
		return products
	}

	// remove user to local storage
	static clearUser() {
		localStorage.removeItem('user')
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const ui = new UI()
	const products = new Products()
	// setup app
	ui.setupApp()

	// get all products
	products
		.getProducts()
		.then(products => {
			ui.displayProducts(products)
			ui.displayCategory(products)
			ui.displayTime()
			Storage.saveProducts(products)
		})
		.then(() => {
			ui.getProductFormCategory()
			ui.inputSearchProduct()
			ui.handleDivider()
			ui.paymentLogic()
			ui.getBtnOrder()
			ui.getTypeOrder()
			ui.getPaymentType()
			ui.submitBill()
		})
})
