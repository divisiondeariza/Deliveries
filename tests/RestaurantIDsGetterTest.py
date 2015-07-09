'''
Created on 7/07/2015

@author: emmanuel
'''
import unittest
from DeliverySpiderProject.RestaurantIDsGetter import RestaurantIDsGetter
from tests.SimulateResponsesUtils import fakeResponseFromFile


class RestautantIDsGetterTest(unittest.TestCase):


    def setUp(self):
        self.response = fakeResponseFromFile("examples/main", None)
        self.restaurantIDsGetter = RestaurantIDsGetter(self.response)


    def tearDown(self):
        pass


    def testGetIDsFromMainPage(self):
        expectedId =self.restaurantIDsGetter.getID("http://www.domiciliosbogota.com/domicilios-pan-pa-ya.html")
        self.assertEquals(expectedId, "6802")
    
    def testIfDoNotHaveIDReturnsNoID(self):
        expectedId =self.restaurantIDsGetter.getID("http://www.domiciliosbogota.com/domicilios-cali-vea-castilla.html")
        self.assertEquals(expectedId, "NoID")       
        


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()