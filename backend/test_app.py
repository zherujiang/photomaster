import unittest
import json
from flask_sqlalchemy import SQLAlchemy
from app import create_app
from models import setup_db, Service, Photo, Price, Photographer
from settings import DB_NAME, DB_USER, DB_PASSWORD


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

        with self.app.app_context():
            self.db = SQLAlchemy()
            self.db.init_app(self.app)
            self.db.create_all()

    def tearDown(self):
        pass

    def test_get_services(self):
        res = self.client().get("/services")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["services"]))
        self.assertTrue("Headshot" in data["services"])

    def test_get_photographers(self):
        res = self.client().get("/photographers?service=wedding&city=seattle")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photographers"]))
        self.assertTrue(data["photographers"][0]["city"] == "seattle")
        self.assertTrue("wedding" in data["photographers"][0]["services"])

    def test_create_photographer(self):
        res = self.client().post("/photographers", json={
            "name": "Tony",
            "email": "tony.photographer@gmail.com",
            "city": "San Francisco",
            "services": ["Headshot", "Event"],
            "profile_photo": "tony.jpg",
            "bio": "I am Tony, a photographer."
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photographers"]))
        self.assertTrue(data["photographers"][0]["name"] == "Tony")
        self.assertTrue("id" in data["photographers"][0])

    def test_update_photographer(self):
        res = self.client().patch("/photographers/1", json={
            "portfolio_link": "danthephotographer.com"
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photographers"]))
        self.assertTrue(len(data["photographers"][0]["portfolio_link"]))

    def test_delete_photographer(self):
        res = self.client().delete("/photographers/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(len(data["photographers"]), 1)
        self.assertTrue(data["photographers"][0]["id"] == 1)

    def test_get_photos(self):
        res = self.client().get("/photos/2")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photos"]))

    def test_404_get_photos_of_nonexisting_photographer(self):
        res = self.client().get("/photos/2146764871541")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertEqual(data["success"], False)
        self.assertEqual(data["message"], "photographer not found")

    def test_add_photos(self):
        res = self.client().post("/photos/2", json={
            "1.jpg",
            "2.jpg"
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photos"]))

    def test_delete_photos(self):
        res = self.client().delete("/photos/2/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual("photos" in data)


if __name__ == "__main__":
    unittest.main()
