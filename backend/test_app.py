import unittest
import json
from app import create_app
from settings import DB_TEST_NAME, DB_USER, DB_TEST_PATH
import os
from sqlalchemy import text, inspect


class PhotomasterTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app(database_path=DB_TEST_PATH)
        self.client = self.app.test_client
        self.db = self.app.extensions["sqlalchemy"]
        self.database_name = DB_TEST_NAME

        with self.app.app_context():
            # get table names from the models.py
            tables = inspect(self.db.engine).get_table_names()
            seqs = inspect(self.db.engine).get_sequence_names()

            test_data_dir = os.path.join(os.path.dirname(
                os.path.realpath(__file__)), "test_data")

            with self.db.engine.begin() as connection:
                for table in tables:
                    csv_filename = os.path.join(test_data_dir, f"{table}.csv")
                    sql_command = text(
                        f"COPY {table} FROM '{csv_filename}' DELIMITER ';' CSV HEADER")
                    connection.execute(sql_command)

                for seq in seqs:
                    connection.execute(
                        f"ALTER SEQUENCE {seq} RESTART WITH 1000;")

    def tearDown(self):
        with self.app.app_context():
            tables = inspect(self.db.engine).get_table_names()

            with self.db.engine.begin() as connection:
                for table in tables:
                    sql_command = text(f"DELETE FROM {table}")
                    connection.execute(sql_command)

    def test_get_services(self):
        res = self.client().get("/services")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["services"]))
        self.assertTrue("Headshot" in [item["name"]
                        for item in data["services"]])

    def test_add_services(self):
        res = self.client().post("/services", json={
            "name": "Pet",
            "image_link": "https://unsplash.com/test.jpg",
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["service"]["name"], "Pet")
        self.assertTrue("id" in data["service"])

    def test_edit_service(self):
        res = self.client().patch("/services/5", json={
            "name": "Commercial",
            "image_link": "https://unsplash.com/fashion.jpg",
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["service"]["image_link"],
                         "https://unsplash.com/fashion.jpg")

    def test_delete_service(self):
        res = self.client().delete("/services/5")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["service"]["id"], 5)

    def test_search_photographers(self):
        res = self.client().get("/photographers?service=3&location=Seattle&page=1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photographers"]))
        self.assertEqual(data["photographers"][0]["city"], "Seattle")

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

    def test_update_photographer(self):
        res = self.client().patch("/photographers/1", json={
            "city": "San Francisco",
            "services": [1, 2],
            "profile_photo": "lunuo.jpg",
            "portfolio_link": "",
            "bio": "I am Lunuo, a photographer.",
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["photographer"]
                         ["profile_photo"], "lunuo.jpg")
        self.assertFalse(data["photographer"]["portfolio_link"])
        self.assertEqual(data["photographer"]
                         ["bio"], "I am Lunuo, a photographer.")
        self.assertTrue(len(data["photos"]))
        # self.assertTrue(len(data["prices"]))
    
    def test_404_update_nonexisting_photographer(self):
        res = self.client().patch("/photographers/256977", json={
            "city": "San Francisco",
            "services": [1, 2],
            "profile_photo": "lunuo.jpg",
            "portfolio_link": "",
            "bio": "I am Lunuo, a photographer.",
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertEqual(data["success"], False)
        self.assertEqual(data["message"], "resource not found")
        
    def test_delete_photographer(self):
        res = self.client().delete("/photographers/10")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["photographer"]["id"], 10)
    
    def test_404_delete_nonexisting_photographer(self):
        res = self.client().delete("/photographers/404321")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertEqual(data["success"], False)
        self.assertEqual(data["message"], "resource not found")

    def test_get_photos(self):
        res = self.client().get("/photographers/2/photos")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertTrue(len(data["photos"]))

    def test_upload_photos(self):
        res = self.client().post("/photos/2", json={
            "file": {
                "filename": "test.jpg"
            }
        })
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["photo"]["photographer_id"], 2)

    def test_404_get_photos_of_nonexisting_photographer(self):
        res = self.client().get("/photographers/2146764871541/photos")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertEqual(data["success"], False)
        self.assertEqual(data["message"], "resource not found")

    def test_delete_photos(self):
        res = self.client().delete("/photographers/2/photos?filename=wedding photo photographer2")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data["success"], True)
        self.assertEqual(data["photo"]["photographer_id"], 2)


if __name__ == "__main__":
    unittest.main()
