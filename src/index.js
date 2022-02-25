const ul = document.querySelector('ul');

ul.addEventListener('click', async(ev) => {
    if (ev.target.tagName === 'LI') {
        const id = ev.target.getAttribute('data-id');
        await axios.delete(`/review/${id}`);
        init()
    }
});

const init = async() => {
    const goodResponse = await axios.get('/goodReviews');
    const badResponse = await axios.get('/badReviews');
    const goodReview = goodResponse.data;
    const badReview = badResponse.data;

    const html1 = goodReview.map(good => {
        return `
        <li data-id='${ good.id }'>
            ${good.name} says that their favorite drink is the ${good.latte.name}
        </li>
        `;
    }).join('');
    const html2 = badReview.map(bad => {
        return `
        <li data-id='${bad.id}'>
            ${bad.name} says that their least favorite drink is the ${bad.latte.name}
        </li>
        `;
    }).join('');
    ul.innerHTML = html1 + html2
}

init();
