(() => {
const form = document.getElementById('enquiry');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const vi = form.dataset.language === 'vi';
    const subject = vi ? 'Trao đổi với RTA' : 'RTA enquiry';
    const body = `${vi ? 'Họ tên' : 'Name'}: ${data.get('name')}\nEmail: ${data.get('email')}\n${vi ? 'Tổ chức' : 'Organisation'}: ${data.get('organisation')}\n\n${data.get('message')}`;
    const result = document.getElementById('enquiry-result');
    const note = document.createElement('p');
    note.textContent = form.dataset.prepared;
    const link = document.createElement('a');
    link.href = `mailto:info@rta.vn?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.textContent = form.dataset.send + ' →';
    result.replaceChildren(note, link);
  });
})();
