import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/home.css';

const Home = () => {
  const testimonials = [
    { name: "Sarah Johnson", role: "Founder, HealthTech Innovations", text: "PitchIn helped us refine our deck and secure $2M in seed funding. The AI feedback was surprisingly accurate!" },
    { name: "Michael Chen",    role: "CEO, AgriGrow",              text: "The investor Q&A simulator prepared us for tough questions we never anticipated. Essential for any founder!" },
    { name: "Emma Wilson",     role: "CTO, EduFuture",             text: "Market validation score gave us the confidence to pivot early. Saved us months of misguided development." }
  ];

  const features = [
    { title: "AI-Powered Analysis",    icon: "🤖", description: "Instant feedback on pitch structure, market fit, and investor readiness" },
    { title: "Investor Q&A Simulator", icon: "💬", description: "Practice with domain-specific questions from virtual investors" },
    { title: "Market Validation",      icon: "📈", description: "Data-driven success prediction with industry benchmarks" }
  ];

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="text-white hero" style={{ background: 'linear-gradient(45deg, #1A1A1A 0%, #DC143C 100%)' }}>
        <Container className="py-5 text-center">
          <h1 className="display-4 mb-3 fw-bold">Transform Your Startup Journey</h1>
          <p className="lead mb-4 fs-4">AI-powered pitch validation, investor readiness training, and market testing</p>
          <Button as={Link} to="/signup" variant="outline-light" size="lg" className="me-3 px-5 py-3 rounded-pill btn-hover">
            Get Started
          </Button>
          <Button as={Link} to="/demo" variant="light" size="lg" className="px-5 py-3 rounded-pill btn-hover-glow">
            Watch Demo
          </Button>
        </Container>
        {/* Demo embed – replace src with your video url */}
        <div className="text-center mt-4">
          <video
            src="/demo-loop.mp4"
            muted
            loop
            autoPlay
            style={{ maxWidth: '80%', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }}
          />
        </div>
      </div>

      {/* Why Choose PitchIn? */}
      <Container className="py-5">
        <h2 className="text-center mb-5 fw-bold gradient-text">Why Choose PitchIn?</h2>
        <Row className="g-4">
          {features.map((f,i) => (
            <Col md={4} key={i}>
              <Card className="h-100 border-0 shadow-lg feature-card">
                <Card.Body className="text-center p-4">
                  <div className="display-1 mb-3">{f.icon}</div>
                  <Card.Title className="fw-bold mb-3">{f.title}</Card.Title>
                  <Card.Text className="text-muted">{f.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* How It Works */}
      <Container className="py-5">
        <h2 className="text-center mb-4 fw-bold">How It Works</h2>
        <Row className="text-center g-4">
          <Col md={3}>
            <div className="mb-3 fs-1">📤</div>
            <h5>Upload Deck</h5>
            <p className="text-muted">PDF or PPT, we parse it instantly.</p>
          </Col>
          <Col md={3}>
            <div className="mb-3 fs-1">⚙️</div>
            <h5>Get AI Analysis</h5>
            <p className="text-muted">Structure, market-fit & investor readiness.</p>
          </Col>
          <Col md={3}>
            <div className="mb-3 fs-1">💬</div>
            <h5>Practice Q&A</h5>
            <p className="text-muted">Simulated investor questions & feedback.</p>
          </Col>
          <Col md={3}>
            <div className="mb-3 fs-1">📊</div>
            <h5>Validate Market</h5>
            <p className="text-muted">Success likelihood & actionable insights.</p>
          </Col>
        </Row>
      </Container>

      {/* Trust Logos */}
      <Container className="py-5 text-center">
        <h5 className="mb-4 text-muted">Trusted by founders at</h5>
        <div className="d-flex justify-content-center align-items-center flex-wrap gap-4">
          <img src="/logos/forbes.png"    alt="Forbes"    height="40" />
          <img src="/logos/techcrunch.png" alt="TechCrunch"height="40" />
          <img src="/logos/entrepreneur.png"alt="Entrepreneur"height="40" />
          <img src="/logos/inc.png"        alt="Inc."      height="40" />
        </div>
      </Container>

      {/* Success Stories */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">Success Stories</h2>
          <Row className="g-4">
            {testimonials.map((t,i) => (
              <Col lg={4} md={6} key={i}>
                <Card className="h-100 border-0 shadow-sm testimonial-card">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="display-4 me-3">🗣️</div>
                      <div>
                        <Card.Title className="mb-0 fw-bold">{t.name}</Card.Title>
                        <small className="text-muted">{t.role}</small>
                      </div>
                    </div>
                    <Card.Text className="fst-italic">"{t.text}"</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Home;

