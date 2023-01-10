export const fetchFromCMS = async ({ url }) => {
  const res = await fetch(`${process.env.CMS_URL}${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.CMS_API_KEY}`,
    },
  });

  if (res.status !== 200) {
    console.error('Failed to fetch');
  }

  return (await res.json()).data;
};
