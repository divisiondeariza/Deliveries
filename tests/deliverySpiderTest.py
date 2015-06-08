'''
Created on 31/05/2015

@author: emmanuel
'''
import unittest
import os
from myproject.spiders import DeliverySpider
from scrapy.http import TextResponse, Request
from myproject.items import Dish


class deliverySpiderTest(unittest.TestCase):

    def setUp(self):
        deliverySpider = DeliverySpider.DeliverySpider()
        response = self.fakeResponseFromFile("examples/HenrysExample", None)
        self.item = deliverySpider.parseRestaurants(response)
    
    def tearDown(self):
        self.item = None
        
    def testGetName(self):
        self.assertEquals(self.item["name"], "Henrys")
    
    def testGetDeliveryTimeInMinutes(self):
        self.assertEquals(self.item["deliveryTimeInMinutes"], 45)   
        
    def testGetMinOrderPrice(self):
        self.assertEquals(self.item["minOrderPrice"], 12000)
        
    def testGetDeliveryCost(self):
        self.assertEqual(self.item["deliveryCost"], 3500, "wrong Delivery cost")
        
    def testGetPayMethods(self):
        self.assertEquals(self.item["payMethods"], [], "wrong pay methods")
    
    def testMenuIsADict(self):
        self.assertIsInstance(self.item["menu"], dict, "menu is not a dict object")
        
    def testMenuContainsAnyCategory(self):
        self.assertIn("Bebidas", self.item["menu"], "menu does not contains Drinks Category")
        
    def testMenuContainsAlCategories(self):
        self.assertEqual(len(self.item["menu"]), 10)
        
    def testMenuCategoryContainsOnlyDishes(self):
        areAllElementsInCategoryDishes = all(isinstance(dish, Dish) for dish in self.item["menu"]["Hamburguesas"])
        self.assertTrue(areAllElementsInCategoryDishes, "There are elements in category that are not Dishes")
    
    def testGetAllDishesInCategory(self):
        self.assertEquals(len(self.item["menu"]["Carnes"]), 12, "Not the correct number of dishes")
    
    @unittest.skip("not yet")
    def testGetCorrectDishName(self):
        dishName = "Perro Americano con Tocineta"
        dishesWhichMatchesWithName = [dish for dish in self.item["menu"]["Perros"] if dish["name"] == dishName]
        self.assertEquals(len(dishesWhichMatchesWithName), 1, 
                          "There should be exactly one dish which matches with dish name")
        
    def fakeResponseFromFile(self, file_name, url=None):
        if not url:
            url = 'http://www.example.com'
        file_path = self.getAbsolutePath(file_name)
        file_content = open(file_path, 'r').read()
        response = TextResponse(url=url,
            request=Request(url=url),
            body=file_content)
        return response
    
    def getAbsolutePath(self, file_name):
        if not file_name[0] == '/':
            responses_dir = os.path.dirname(os.path.realpath(__file__))
            return os.path.join(responses_dir, file_name)
        else:
            return file_name
        
   

        


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()