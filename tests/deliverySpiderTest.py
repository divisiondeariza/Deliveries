# -*- coding: utf-8 -*-
'''
Created on 31/05/2015

@author: emmanuel
'''

import unittest
import os
from myproject.spiders import DeliverySpider
from scrapy.http import TextResponse, Request
from myproject.items import Dish

def getDishByName(dishes, dishName):
    return next(dish for dish in dishes if dish["name"] == dishName)
         
def fakeResponseFromFile(file_name, url=None):
    if not url:
        url = 'http://www.example.com'
    file_path = getAbsolutePath(file_name)
    file_content = open(file_path, 'r').read()
    response = TextResponse(url=url,
        request=Request(url=url),
        body=file_content)
    return response

def getAbsolutePath(file_name):
    if not file_name[0] == '/':
        responses_dir = os.path.dirname(os.path.realpath(__file__))
        return os.path.join(responses_dir, file_name)
    else:
        return file_name
    
    
    
class HenrysExampleTestCase(unittest.TestCase):
    def setUp(self):
        deliverySpider = DeliverySpider.DeliverySpider()
        response = fakeResponseFromFile("examples/HenrysExample", None)
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
        payMethods = ["efectivo", u"Débito", u"Crédito", "Sodexo", "Sodexo"]
        self.assertEquals(self.item["payMethods"], payMethods)
        
    def testGetTagCategories(self):
        tagCategories = ["Hamburguesas", "Sanduches", "Perros Calientes"]
        self.assertEquals(self.item["tagCategories"], tagCategories)
    
    def testMenuIsAList(self):
        self.assertIsInstance(self.item["menu"], list, "menu is not a list object")
    
    def testMenuContainsAnyCategory(self):
        categoryNamesInMenu = [category["name"] for category in self.item["menu"]]
        self.assertIn("Bebidas", categoryNamesInMenu, "menu does not contains Drinks Category")
       
    def testMenuContainsAlCategories(self):
        self.assertEqual(len(self.item["menu"]), 10)
     
    def testMenuCategoryDishesContainsOnlyDishes(self):
        category = next(c for c in self.item["menu"] if c["name"] == "Hamburguesas")
        areAllElementsInCategoryDishes = all(isinstance(dish, Dish) for dish in category["dishes"])
        self.assertTrue(areAllElementsInCategoryDishes, "There are elements in category that are not Dishes")
    
    def testGetAllDishesInCategory(self):
        category = next(c for c in self.item["menu"] if c["name"] == "Carnes")
        self.assertEquals(len(category["dishes"]), 12, "Not the correct number of dishes")
        
    def testDescriptionIsNoneIfDishHasNoDescription(self):
        category = next(c for c in self.item["menu"] if c["name"] == "Bebidas")
        dish = getDishByName(category["dishes"], "Limonada Natural 12 onzas")
        self.assertEqual(dish["description"], None)        
   
    def testGetCorrectDishDescriptionWhenExist(self):
        category = next(c for c in self.item["menu"] if c["name"] == "Salchipapa")
        dish = getDishByName(category["dishes"], "Sanchipapa Maxilunch")
        description = "Salchicha maxilunch y papa a la francesa"
        self.assertEqual(dish["description"], description)
        
    def testGetCorrectPriceWhenExist(self):
        category = next(c for c in self.item["menu"] if c["name"] == u"Menú infantil")
        dish = getDishByName(category["dishes"], "Henry Kids")
        price = 11500
        self.assertEqual(dish["price"], price)
        
    def testGetAveragePunctuation(self):
        self.assertEqual(self.item["averagePunctuation"], 3)
        
    def testGetQuantityOfComments(self):
        self.assertEqual(self.item["quantityOfComments"], 874)
        
class RedBoxExampleTestCase(unittest.TestCase):
    def setUp(self):
        deliverySpider = DeliverySpider.DeliverySpider()
        response = fakeResponseFromFile("examples/RedBoxExample", None)
        self.item = deliverySpider.parseRestaurants(response)

    def tearDown(self):
        self.item = None
        
    def testMinOrderPriceIsZeroWhenRestaurantHasNotMinPrice(self):
        self.assertEquals(self.item["minOrderPrice"], 0)

if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()