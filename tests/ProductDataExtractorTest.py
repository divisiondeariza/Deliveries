# -*- coding: utf-8 -*-
'''
Created on 23/08/2015

@author: emmanuel
'''
import unittest
from tests.SimulateResponsesUtils import fakeResponseFromFile
from DeliverySpiderProject import ProductDataExtractor


class ProductDataExtractorTest(unittest.TestCase):

    def setUp(self):
        response = fakeResponseFromFile("examples/ProductExample.json", None)
        self.productDataExtractor = ProductDataExtractor.ProductDataExtractor(response)

    def tearDown(self):
        pass
    
    def testGetRestaurant(self):
        restaurant = self.productDataExtractor.getRestaurant()
        self.assertEqual(restaurant, u"Maos Pizza")
    

    def testProductRestaurantBelongsToTag(self):
        belongsToTag = self.productDataExtractor.restaurantBelongsToTag("Pizza", "examples/restaurants.json")
        self.assertTrue(belongsToTag)
        
    def testProductRestaurantDoesNotBelongsToTag(self):
        belongsToTag = self.productDataExtractor.restaurantBelongsToTag("Non-existent-tag", "examples/restaurants.json")
        self.assertFalse(belongsToTag)
        
    def testProductRestaurantBelongsToTagList(self):
        tagList = ["Comida Colombiana", 
                   "Comida Vegetariana", 
                   "Ensalada", 
                   "Sanduches",
                   "Comida Colombiana", 
                   "Comida Saludable",
                   "Pizza"]
        belongsToTagList = self.productDataExtractor.restaurantBelongsToTagList(tagList, "examples/restaurants.json")
        self.assertTrue(belongsToTagList)        
 
    def testProductRestaurantDoesNotBelongsToTagList(self):
        tagList = ["Comida Colombiana", 
                   "Comida Vegetariana", 
                   "Ensalada", 
                   "Sanduches",
                   "Comida Colombiana", 
                   "Comida Saludable"]
        belongsToTagList = self.productDataExtractor.restaurantBelongsToTagList(tagList, "examples/restaurants.json")
        self.assertFalse(belongsToTagList)        
        
    def testGetProductCategory(self):
        productCategory =  self.productDataExtractor.getProductCategory()
        self.assertEqual(productCategory, "Pizzas Tradicionales")
        
    def testGetName(self):
        name = self.productDataExtractor.getName()
        self.assertEqual(name, u"Pizza Pollo Champiñón")
        
    def testGetDescription(self):
        description = self.productDataExtractor.getDescription()
        self.assertEqual(description, u"Pizza con champiñón and stuff")
        
    def testGetPrice(self):
        price = self.productDataExtractor.getPrice()
        self.assertEqual(price, 9000)
        
    def testGetRestaurantCategories(self):
        restaurantCategories = self.productDataExtractor.getRestaurantCategories("examples/restaurants.json")
        self.assertListEqual(restaurantCategories, ["Pizza", "Nuevos Restaurantes"])
    
    def testGetEmptyRestaurantCategoriesListWhenNoRestaurantFound(self):
        restaurantCategories = self.productDataExtractor.getRestaurantCategories("examples/restaurantsEmpty.json")
        self.assertListEqual(restaurantCategories, [])
        
                
if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()