import pytest


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_simulator_step(client):
    response = await client.post("/api/v1/simulator/step")
    assert response.status_code == 200
    data = response.json()
    assert "sensor_evaluations" in data
    assert "decisions" in data
    assert "growth_stage" in data
    assert "crop" in data
    assert data["crop"] == "Tomato"


@pytest.mark.asyncio
async def test_simulator_step_with_body(client):
    body = {
        "readings": {
            "soil_moisture": 20.0,
            "temperature": 35.0,
            "humidity": 85.0,
            "light_intensity": 500.0,
            "soil_ph": 6.5,
            "nitrogen": 50.0,
            "wind_speed": 5.0,
        },
        "growth_stage": "fruiting",
    }
    response = await client.post("/api/v1/simulator/step", json=body)
    assert response.status_code == 200
    data = response.json()
    assert len(data["decisions"]) > 0


@pytest.mark.asyncio
async def test_simulator_reset(client):
    response = await client.post("/api/v1/simulator/step")
    assert response.status_code == 200

    response = await client.post("/api/v1/simulator/reset")
    assert response.status_code == 200
    assert response.json() == {"message": "Simulator reset to initial state"}


@pytest.mark.asyncio
async def test_sensor_list(client):
    response = await client.get("/api/v1/simulator/sensors")
    assert response.status_code == 200
    data = response.json()
    assert "sensors" in data
    assert "growth_stages" in data
    assert data["crop"] == "Tomato"
    assert len(data["sensors"]) == 7


@pytest.mark.asyncio
async def test_decisions_endpoint(client):
    await client.post("/api/v1/simulator/step")
    response = await client.get("/api/v1/decisions?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_sensor_readings_endpoint(client):
    await client.post("/api/v1/simulator/step")
    response = await client.get("/api/v1/sensors/temperature/readings?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
