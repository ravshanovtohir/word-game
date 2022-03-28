//Chundilayu nima bovotganini
submit.onclick = async(e) => {
    console.log("Hello");
    e.preventDefault()
    if (username.value.trim().split(' ').length > 1 || !username.value || !image.files.length) return alert('Invalid input')
    if (image.files[0].type == 'image/jpeg' || image.files[0].type == 'image/png') {
        let formData = new FormData()
        formData.append('image', image.files[0])
        formData.append('username', username.value)

        try {
            const test = await fetch('/enter', {
                method: 'POST',
                body: formData
            })
            const data = await test.json()
            if (data.status >= 400 && data.status <= 499) { throw new Error('Xato') }

            window.localStorage.setItem('userId', data.userId)
            window.location = data.site

        } catch (error) {
            console.log(error);
            alert('Nimadadir Xato bor')
        }
    } else alert('Invalid input')
}