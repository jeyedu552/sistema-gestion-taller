fetch('http://localhost:3000/api/auth/users')
  .then(res => res.json())
  .then(users => {
    const marcos = users.find(u => u.email.includes('marcos'));
    console.log(marcos);
    if(marcos && !marcos.isActive) {
       console.log('Marcos está inactivo. Vamos a activarlo...');
       return fetch(`http://localhost:3000/api/auth/users/${marcos.id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ isActive: true })
       }).then(r => r.json()).then(console.log);
    } else {
       console.log('Marcos está activo o no existe.');
    }
  });
