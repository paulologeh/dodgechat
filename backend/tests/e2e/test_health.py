def test_health_check(client):
    """
    Ensure that the health check returns a successful status code
    """
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_data(as_text=True) == "Ok"
