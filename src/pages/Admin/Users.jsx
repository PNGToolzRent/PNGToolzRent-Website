// Inside the useEffect, add a limit
useEffect(() => {
  // Limit to 50 users for speed, order by creation
  getDocs(query(collection(db, 'users'), where('role', '==', 'client'), orderBy('createdAt', 'desc'), limit(50)))
    .then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
}, [])
