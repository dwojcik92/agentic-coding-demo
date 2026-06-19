Build from scratch a universal expert system for making decisions based on sensor data.

The system must be independent of LLMs: decisions must come from an explicit knowledge base, 
facts, thresholds, and rules, not from a generative language model. 
The knowledge base and rule base should be configurable
 so the system can be adapted to different domains.

Include a working demo in precision agriculture. 
The demo should simulate a stream of sensor readings for a concrete crop 
and show how the system updates its internal state and generates multiple types of decisions:
irrigation, fertilization, plant stress, disease risk, growth-condition quality, 
and observational recommendations.

Every decision must include a clear explanation showing which sensor readings, facts, 
and rules led to the recommendation. 
The demo should show how decisions change over time as incoming sensor data changes.

Deliver working code, an example knowledge/rule base, a sensor-stream simulator, 
and a runnable demo with nice visuals.

System architeture:
1. Use AGENTS.md rules
2. Database: mysql (docker)
3. Simulator should be part of backend REST API.
4. Make sure we have backend tests and E2E tests with playwright.
5. Ask before code.
6. Make atomic commits and tag after each feature.
 
