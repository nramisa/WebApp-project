import React from 'react';



import { Link } from 'react-router-dom';


import { Button, Container, Row, Col, Card } from 'react-bootstrap';


import '../styles/home.css';





const Home = () => {


  const testimonials = [


    {


      name: "Sarah Johnson",


      role: "Founder, HealthTech Innovations",


      text: "PitchIn helped us refine our deck and secure $2M in seed funding. The AI feedback was surprisingly accurate!",


    },


    {


      name: "Michael Chen",


      role: "CEO, AgriGrow",


      text: "The investor Q&A simulator prepared us for tough questions we never anticipated. Essential for any founder!",


    },


    {


      name: "Emma Wilson",


      role: "CTO, EduFuture",


      text: "Market validation score gave us the confidence to pivot early. Saved us months of misguided development.",


    }


  ];





  const features = [


    {


      title: "AI-Powered Analysis",


      icon: "🤖",


      description: "Instant feedback on pitch structure, market fit, and investor readiness"


    },


    {


      title: "Investor Q&A Simulator",


      icon: "💬",


      description: "Practice with domain-specific questions from virtual investors"


    },


    {


      title: "Market Validation",


      icon: "📈",


      description: "Data-driven success prediction with industry benchmarks"


    }


  ];





  return (


    <div className="home-page">


      <div 


        className="text-white hero"


        style={{ 


          background: 'linear-gradient(45deg, #1A1A1A 0%, #DC143C 100%)',


        }}


      >


        <Container className="py-5 text-center">


          <h1 className="display-4 mb-4 fw-bold">Transform Your Startup Journey</h1>


          <p className="lead mb-4 fs-4">AI-powered pitch validation, investor readiness training, and market testing</p>


          <Button 


            as={Link} 


            to="/signup"


            variant="outline-light" 


            size="lg" 


            className="px-5 py-3 rounded-pill btn-hover"


          >


            Get Started


          </Button>


        </Container>


      </div>





      <Container className="py-5">


        <h2 className="text-center mb-5 fw-bold">Why Choose PitchIn?</h2>


        <Row className="g-4">


          {features.map((feature, index) => (


            <Col md={4} key={index}>


              <Card className="h-100 border-0 shadow-lg feature-card">


                <Card.Body className="text-center p-4">


                  <div className="display-1 mb-3">{feature.icon}</div>


                  <Card.Title className="fw-bold mb-3">{feature.title}</Card.Title>


                  <Card.Text className="text-muted">


                    {feature.description}


                  </Card.Text>


                </Card.Body>


              </Card>


            </Col>


          ))}


        </Row>


      </Container>





      <div className="bg-light py-5">


        <Container>


          <h2 className="text-center mb-5 fw-bold">Success Stories</h2>


          <Row className="g-4">


            {testimonials.map((testimonial, index) => (


              <Col lg={4} md={6} key={index}>


                <Card className="h-100 border-0 shadow-sm testimonial-card">


                  <Card.Body className="p-4">


                    <div className="d-flex align-items-center mb-3">


                      <span className="display-4 me-3">{testimonial.avatar}</span>


                      <div>


                        <Card.Title className="mb-0 fw-bold">{testimonial.name}</Card.Title>


                        <small className="text-muted">{testimonial.role}</small>


                      </div>


                    </div>


                    <Card.Text className="fst-italic">


                      "{testimonial.text}"


                    </Card.Text>


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
