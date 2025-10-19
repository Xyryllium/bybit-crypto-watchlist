# Bybit Trading Charts

A real-time cryptocurrency trading interface built with React Router, featuring live Bybit perpetual contracts data, interactive candlestick charts, and market watchlists.

## What This App Does

This application provides a clean, professional interface for monitoring cryptocurrency markets using Bybit's WebSocket API. It displays real-time price data, volume information, and trading activity for perpetual contracts.

### Key Features

- **Live Market Data**: Real-time price feeds from Bybit WebSocket API
- **Interactive Charts**: Professional candlestick charts with multiple timeframes
- **Market Watchlist**: Track multiple trading pairs simultaneously
- **Volume Analysis**: Monitor trading volume and activity
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React Router v7 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Charts**: Custom chart implementation for candlestick data
- **Real-time Data**: WebSocket connections to Bybit API
- **Build Tool**: Vite for fast development and building

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd bybit-crypto-watchlist
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

Create a production build:

```bash
npm run build
```

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── BybitKlineChart.tsx    # Main chart component
│   ├── BybitWatchlist.tsx     # Market watchlist
│   ├── VolumeTradeLog.tsx     # Trading volume display
│   └── ui/                    # Base UI components
├── contexts/            # React contexts
│   └── BybitWebSocketContext.tsx
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API clients
├── routes/              # Page components
│   ├── trading.tsx      # Main trading interface (index)
│   └── home.tsx         # Landing page
└── root.tsx             # App root component
```

## API Integration

The app connects to Bybit's WebSocket API for real-time market data:

- **Kline Data**: Candlestick chart information
- **Ticker Data**: Real-time price updates
- **Trade Data**: Recent trading activity
- **Symbols**: Available trading pairs

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t bybit-crypto-watchlist .
docker run -p 3000:3000 bybit-crypto-watchlist
```

### Manual Deployment

Deploy the built application:

```bash
npm run build
# Deploy the build/ directory to your hosting platform
```

## Configuration

The application uses environment variables for configuration. Create a `.env` file:

```env
# Add any required environment variables here
```

## Contributing

This is a personal project for cryptocurrency market monitoring. Feel free to fork and modify for your own use.

## License

MIT License - see LICENSE file for details.

---

Built with React Router and real market data from Bybit.
