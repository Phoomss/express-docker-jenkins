import express, { type Express, type Request, type Response } from 'express'

const app: Express = express()

const port: number = 3000

// Routes
// GET /
app.get('/', (_: Request, res: Response) => {
  res.json({
    message: 'Hello Express + TypeScript! 777'
  })
})

// GET /api/hello
app.get('/api/hello', (_: Request, res: Response) => {
  res.json({
    message: 'Hello from Express API!'
  })
})

// GET /api/health
app.get('/api/health', (_: Request, res: Response) => {
  res.json({
    status: 'UP'
  })
})

// GET /api/users
app.get('/api/users', (_: Request, res: Response) => {
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' }
  ]
  res.json(users)
})

// GET /api/products
app.get('/api/products', (_: Request, res: Response) => {
  const products = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 150 },
    { id: 3, name: 'Product C', price: 200 },
    { id: 4, name: 'Product D', price: 250 }
  ]
  res.json(products)
})

// GET /api/orders
app.get('/api/orders', (_: Request, res: Response) => {
  const orders = [
    { id: 1, userId: 1, productId: 2, quantity: 1 },
    { id: 2, userId: 2, productId: 3, quantity: 2 },
    { id: 3, userId: 1, productId: 1, quantity: 1 },
    { id: 4, userId: 2, productId: 4, quantity: 1 }
  ]
  res.json(orders)
})

// Start server
app.listen(port, () => console.log(`Application is running on port ${port}`))