export function addTailwindClasses(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const ols = doc.querySelectorAll('ol');
  ols.forEach(ol => {
    ol.classList.add('list-decimal', 'list-inside', 'mb-4');
    if (ol.closest('li')) ol.classList.add('ml-6');
    if (!ol.hasAttribute('start')) ol.setAttribute('start', '1');
    if (ol.textContent?.includes('Rent Agreement Service')) ol.setAttribute('start', '10');
  });

  const uls = doc.querySelectorAll('ul');
  uls.forEach(ul => {
    ul.classList.add('list-disc', 'list-inside', 'mb-4');
    if (ul.closest('li')) ul.classList.add('ml-6');
  });

  const lis = doc.querySelectorAll('li');
  lis.forEach(li => {
    if (!li.classList.contains('list-none')) {
      li.classList.add('list-item');
    }
  });

  return doc.body.innerHTML;
}
