const notificationService = () => {
  const url = 'https://api.onesignal.com/notifications?c=push';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization:
        'os_v2_app_3l5446o4e5eubhhadaomqax5s7fgsywq6ylu4lvvknez65lnbbw2wsaptszgoyzmmdnrkvhhte674jvzckd5bokklq4iucbwfqg5ila',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      app_id: 'dafbce79-dc27-4940-9ce0-181cc802fd97',
      contents: {en: 'Your message body here.'},
      url: 'https://awesomeshop.app/product/684311b1c2649451e2caec63',
      big_picture:
        'https://awesomeshop.app/uploads/684311b1c2649451e2caec63.jpg',
      included_segments: ['Test Users'],
    }),
  };

  fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error(err));
};
export default notificationService;
