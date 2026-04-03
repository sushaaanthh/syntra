#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Syntra Platform
Tests all endpoints with proper authentication and error handling
"""

import requests
import sys
import json
import io
from datetime import datetime, timedelta
from pathlib import Path

class SyntraAPITester:
    def __init__(self, base_url="https://eaedb562-88a2-438a-8d2e-ca374d80b6c5.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.user_data = None
        
    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"name": name, "details": details})
        print()

    def test_health_check(self):
        """Test health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data.get('status', 'unknown')}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_register(self):
        """Test user registration"""
        try:
            test_user = {
                "email": f"test_{datetime.now().strftime('%H%M%S')}@syntra.test",
                "password": "TestPass123!",
                "name": "Test User"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=test_user
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                self.user_data = response.json()
                details += f", User ID: {self.user_data.get('user_id', 'unknown')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("User Registration", success, details)
            return success
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
            return False

    def test_login_admin(self):
        """Test admin login"""
        try:
            admin_creds = {
                "email": "admin@syntra.app",
                "password": "SyntraAdmin123!"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=admin_creds
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                self.user_data = response.json()
                details += f", Role: {self.user_data.get('role', 'unknown')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Admin Login", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False

    def test_get_me(self):
        """Test get current user"""
        try:
            response = self.session.get(f"{self.base_url}/api/auth/me")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                user = response.json()
                details += f", User: {user.get('name', 'unknown')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get Current User", success, details)
            return success
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
            return False

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/dashboard/stats")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                stats = response.json()
                details += f", Contacts: {stats.get('contacts', 0)}, Invoices: {stats.get('invoices', 0)}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Dashboard Stats", success, details)
            return success
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Exception: {str(e)}")
            return False

    def test_create_contact(self):
        """Test contact creation"""
        try:
            contact_data = {
                "name": "Test Contact",
                "email": "test.contact@example.com",
                "phone": "+91 98765 43210",
                "company": "Test Company",
                "status": "Lead",
                "notes": "Test contact for API testing"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/contacts",
                json=contact_data
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                contact = response.json()
                details += f", Contact ID: {contact.get('contact_id', 'unknown')}"
                self.test_contact_id = contact.get('contact_id')
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Create Contact", success, details)
            return success
        except Exception as e:
            self.log_test("Create Contact", False, f"Exception: {str(e)}")
            return False

    def test_get_contacts(self):
        """Test get contacts"""
        try:
            response = self.session.get(f"{self.base_url}/api/contacts")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                contacts = response.json()
                details += f", Count: {len(contacts)}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get Contacts", success, details)
            return success
        except Exception as e:
            self.log_test("Get Contacts", False, f"Exception: {str(e)}")
            return False

    def test_create_invoice(self):
        """Test invoice creation"""
        try:
            invoice_data = {
                "client_name": "Test Client",
                "client_email": "client@test.com",
                "client_phone": "+91 98765 43210",
                "client_gstin": "22AAAAA0000A1Z5",
                "client_address": "123 Test Street, Mumbai",
                "tax_type": "intra",
                "due_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                "notes": "Test invoice",
                "items": [
                    {
                        "name": "Test Product",
                        "quantity": 2,
                        "price": 1000.00,
                        "hsn_code": "1234"
                    }
                ]
            }
            
            response = self.session.post(
                f"{self.base_url}/api/invoices",
                json=invoice_data
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                invoice = response.json()
                details += f", Invoice: {invoice.get('invoice_number', 'unknown')}, Amount: ₹{invoice.get('total_amount', 0)}"
                self.test_invoice_id = invoice.get('invoice_id')
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Create Invoice", success, details)
            return success
        except Exception as e:
            self.log_test("Create Invoice", False, f"Exception: {str(e)}")
            return False

    def test_get_invoices(self):
        """Test get invoices"""
        try:
            response = self.session.get(f"{self.base_url}/api/invoices")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                invoices = response.json()
                details += f", Count: {len(invoices)}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get Invoices", success, details)
            return success
        except Exception as e:
            self.log_test("Get Invoices", False, f"Exception: {str(e)}")
            return False

    def test_download_invoice_pdf(self):
        """Test invoice PDF download"""
        if not hasattr(self, 'test_invoice_id'):
            self.log_test("Download Invoice PDF", False, "No invoice ID available")
            return False
            
        try:
            response = self.session.get(
                f"{self.base_url}/api/invoices/{self.test_invoice_id}/pdf"
            )
            
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            details = f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}"
            
            if success:
                details += f", PDF Size: {len(response.content)} bytes"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Download Invoice PDF", success, details)
            return success
        except Exception as e:
            self.log_test("Download Invoice PDF", False, f"Exception: {str(e)}")
            return False

    def test_excel_upload(self):
        """Test Excel file upload"""
        try:
            # Create a simple CSV content
            csv_content = "Name,Email,Phone,Company\nJohn Doe,john@test.com,+91 98765 43210,Test Corp\nJane Smith,jane@test.com,+91 98765 43211,Test Inc"
            
            files = {
                'file': ('test_data.csv', io.StringIO(csv_content), 'text/csv')
            }
            
            response = self.session.post(
                f"{self.base_url}/api/excel/upload",
                files=files
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", File ID: {result.get('file_id', 'unknown')}, Rows: {result.get('row_count', 0)}"
                self.test_file_id = result.get('file_id')
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Excel Upload", success, details)
            return success
        except Exception as e:
            self.log_test("Excel Upload", False, f"Exception: {str(e)}")
            return False

    def test_get_excel_files(self):
        """Test get Excel files"""
        try:
            response = self.session.get(f"{self.base_url}/api/excel/files")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                files = response.json()
                details += f", Count: {len(files)}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get Excel Files", success, details)
            return success
        except Exception as e:
            self.log_test("Get Excel Files", False, f"Exception: {str(e)}")
            return False

    def test_create_automation(self):
        """Test automation creation"""
        try:
            automation_data = {
                "name": "Test Automation",
                "trigger_type": "new_row",
                "trigger_condition": {"column": "status", "value": "new"},
                "action_type": "create_invoice",
                "action_config": {"template": "default"},
                "is_active": True
            }
            
            response = self.session.post(
                f"{self.base_url}/api/automations",
                json=automation_data
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                automation = response.json()
                details += f", Automation ID: {automation.get('automation_id', 'unknown')}"
                self.test_automation_id = automation.get('automation_id')
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Create Automation", success, details)
            return success
        except Exception as e:
            self.log_test("Create Automation", False, f"Exception: {str(e)}")
            return False

    def test_get_automations(self):
        """Test get automations"""
        try:
            response = self.session.get(f"{self.base_url}/api/automations")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                automations = response.json()
                details += f", Count: {len(automations)}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get Automations", success, details)
            return success
        except Exception as e:
            self.log_test("Get Automations", False, f"Exception: {str(e)}")
            return False

    def test_whatsapp_templates(self):
        """Test WhatsApp templates"""
        try:
            response = self.session.get(f"{self.base_url}/api/whatsapp/templates")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                templates = response.json()
                details += f", Templates: {len(templates)}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("WhatsApp Templates", success, details)
            return success
        except Exception as e:
            self.log_test("WhatsApp Templates", False, f"Exception: {str(e)}")
            return False

    def test_send_whatsapp(self):
        """Test WhatsApp message sending (simulated)"""
        if not hasattr(self, 'test_contact_id'):
            self.log_test("Send WhatsApp", False, "No contact ID available")
            return False
            
        try:
            message_data = {
                "contact_id": self.test_contact_id,
                "template": "welcome",
                "custom_message": "Welcome to our service!"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/whatsapp/send",
                json=message_data
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", Status: {result.get('status', 'unknown')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Send WhatsApp (Simulated)", success, details)
            return success
        except Exception as e:
            self.log_test("Send WhatsApp (Simulated)", False, f"Exception: {str(e)}")
            return False

    def test_activities(self):
        """Test activities feed"""
        try:
            response = self.session.get(f"{self.base_url}/api/activities?limit=10")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                activities = response.json()
                details += f", Activities: {len(activities)}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Activities Feed", success, details)
            return success
        except Exception as e:
            self.log_test("Activities Feed", False, f"Exception: {str(e)}")
            return False

    def test_logout(self):
        """Test logout"""
        try:
            response = self.session.post(f"{self.base_url}/api/auth/logout")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", Message: {result.get('message', 'unknown')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Logout", success, details)
            return success
        except Exception as e:
            self.log_test("Logout", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Syntra Backend API Tests")
        print("=" * 50)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Authentication flow
        if not self.test_login_admin():
            print("❌ Admin login failed - stopping tests")
            return False
            
        self.test_get_me()
        
        # Core functionality
        self.test_dashboard_stats()
        self.test_create_contact()
        self.test_get_contacts()
        self.test_create_invoice()
        self.test_get_invoices()
        self.test_download_invoice_pdf()
        self.test_excel_upload()
        self.test_get_excel_files()
        self.test_create_automation()
        self.test_get_automations()
        self.test_whatsapp_templates()
        self.test_send_whatsapp()
        self.test_activities()
        
        # Test registration (separate session)
        self.test_register()
        
        # Cleanup
        self.test_logout()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as passing

def main():
    tester = SyntraAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())