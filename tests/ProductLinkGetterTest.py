'''
Created on 4/07/2015

@author: emmanuel
'''
import unittest
from DeliverySpiderProject.ProductLinkGetter import ProductLinkGetter


class Test(unittest.TestCase):


    def setUp(self):
        pass


    def tearDown(self):
        pass


    def testGetUUrlFromProductID(self):
        id = "12345"
        productLinkGetter = ProductLinkGetter()
        expectedLink = "http://www.domiciliosbogota.com/establecimientos/producto/12345"
        self.assertEqual(expectedLink, productLinkGetter.getLink(id)) 
        
    def testReturnNoneWhenLinkIsNotNumeric(self):
        id = "cat-12345"
        productLinkGetter = ProductLinkGetter()
        self.assertEqual(None, productLinkGetter.getLink(id)) 


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testGetUUrlFromProductID']
    unittest.main()