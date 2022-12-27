import unittest
import json
from flask_sqlalchemy import SQLAlchemy
from app import create_app
from models import setup_db, Service, Photo, Price, Photographer
from settings import DB_USER, DB_PASSWORD


class PhotomasterTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client

        self.database_name = "photomaster_test"
        db_user_credentials = DB_USER + ":" + DB_PASSWORD
        if DB_USER or DB_PASSWORD:
            self.database_path = "postgresql://{}@{}/{}".format(
                db_user_credentials, "localhost:5432", self.database_name)
        else:
            self.database_path = "postgresql://{}/{}".format(
                "localhost:5432", self.database_name)
        setup_db(self.app, self.database_path)

        # with self.app.app_context():
        #     self.db = SQLAlchemy()
        #     self.db.init_app(self.app)
        #     self.db.create_all()
        
    def tearDown(self):
        pass

    def test_get_services(self):
        res = self.client().get("/services")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["services"]))
        self.assertTrue("Headshot" in [item["name"] for item in data["services"]])

    def test_add_services(self):
        res = self.client().post("/services", json={
            "name": "Wedding",
            "image_link": "https://jacksonmanor.com/cake.jpg",
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["service"]["name"], "Wedding")
        self.assertTrue("id" in data["service"])
    
    def test_edit_service(self):
        res = self.client().patch("/services/1", json={
            "name": "Headshot",
            "image_link": "https://googledrive.com/headshot.jpg",
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["service"]["image_link"], "https://googledrive.com/headshot.jpg")
    
    def test_delete_service(self):
        res = self.client().delete("/services/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["service"], 1)
    
    def test_search_photographers(self):
        res = self.client().get("/photographers?service=portrait&location=seattle&page=1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photographers"]))
        self.assertEqual(data["photographers"][0]["city"], "seattle")
        
    def test_view_photographer_details(self):
        res = self.client().get("/photographer-details/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photographer"]))
        self.assertTrue("portfolio_link" in data["photographer"])
    
    def test_create_photographer(self):
        res = self.client().post("/photographers", json={
            "name": "Tony",
            "email": "tony.photographer@gmail.com",
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["photographer"]["name"], "Tony")
        self.assertTrue("id" in data["photographer"])

    def test_get_update_photographer(self):
        res = self.client().get("/photographers/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue("bio" in data["photographer"])
        self.assertTrue("photos" in data)
        self.assertTrue("prices" in data)
    
    def test_patch_update_photographer(self):
        res = self.client().patch("/photographers/1", json={
            "city": "San Francisco",
            "services": ["Headshot", "Event"],
            "profile_photo": "tony.jpg",
            "bio": "I am Tony, a photographer.",
            "portfolio_link": "danthephotographer.com"
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["photographer"]["portfolio_link"], "danthephotographer.com")
        #self.assertTrue(len(data["photos"]))
        #self.assertTrue(len(data["prices"]))

    def test_delete_photographer(self):
        res = self.client().delete("/photographers/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["photographer"]["id"],1)
    
        
    def test_get_photos(self):
        res = self.client().get("/photos/2")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photos"]))
    
    def test_add_photos(self):
        res = self.client().post("/photos/2", json={
            "file": {
                "filename": "cake.jpg"
            }
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["image"]["photographer_id"], 2)
        
    def test_404_get_photos_of_nonexisting_photographer(self):
        res = self.client().get("/photos/2146764871541")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertEqual(data["success"], False)
        self.assertEqual(data["message"], "resource not found")

    # def test_delete_photos(self):
    #     res = self.client().delete("/photos/2/image_path")
    #     data = json.loads(res.data)

    #     self.assertEqual(res.status_code, 200)
    #     self.assertEqual(data["success"], True)
    #     self.assertEqual(data["photo"]["photographer_id"], 2)
   

if __name__ == "__main__":
    unittest.main()
