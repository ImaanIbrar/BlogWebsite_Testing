from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    host = "http://localhost:3001"  
    wait_time = between(0.1, 0.5)

    def on_start(self):
        self.login()
    
    def login(self):
     response = self.client.post(
        "/api/login", 
        json={      
            "username": "ab123",
            "password": "secret"}
        
    )
     if response.status_code == 200:
        print("Login successful")
        # If login is successful, extract token for future requests
        self.token = response.json().get('token', None)
        print(f"JWT token: {self.token}") 
     else:
        print("Login failed")
        print(f"Response content: {response.content}")  # Print response content for debugging
        self.token = None  


    @task
    def index_page(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        self.client.get("/", headers=headers)

    @task
    def view_blogs(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        self.client.get("/blogs", headers=headers)

    @task
    def view_users(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        self.client.get("/users", headers=headers)


    @task
    def view_health(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        self.client.get("/health", headers=headers)

    @task
    def view_single_blog(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        self.client.get("/blogs/66407416225485fef89f8055", name="single_blog", headers=headers)


  
    @task
    def view_user_profile(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        self.client.get("/users/66406084225485fef89f23ad", name="user_profile", headers=headers)
   
