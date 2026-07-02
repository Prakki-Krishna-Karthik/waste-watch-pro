from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from utils.database import db
from routes.auth import auth_bp
from routes.inventory import inventory_bp
from routes.research import research_bp
from routes.payroll import payroll_bp
from routes.tasks import tasks_bp
from routes.profile import profile_bp
from models.user import UserModel
from datetime import datetime
import bcrypt

app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.config.from_object(Config)
CORS(app)
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(research_bp, url_prefix='/api/research')
app.register_blueprint(payroll_bp, url_prefix='/api/payroll')
app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
app.register_blueprint(profile_bp, url_prefix='/api')

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'login.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

def create_default_users():
    # Admin
    if not UserModel.find_by_username('admin'):
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw('admin123'.encode('utf-8'), salt)
        UserModel.collection.insert_one({
            'username': 'admin',
            'password': hashed,
            'email': 'admin@wastewatch.com',
            'fullName': 'System Administrator',
            'role': 'admin',
            'employeeId': 'ADMIN001',
            'department': 'Administration',
            'salary': 100000,
            'phone': '9999999999',
            'address': 'Admin Office',
            'createdAt': datetime.now()
        })
        print('✅ Admin created: admin/admin123')
    
    # Doctor
    if not UserModel.find_by_username('doctor'):
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw('doctor123'.encode('utf-8'), salt)
        UserModel.collection.insert_one({
            'username': 'doctor',
            'password': hashed,
            'email': 'doctor@wastewatch.com',
            'fullName': 'Dr. Sarah Wilson',
            'role': 'doctor',
            'employeeId': 'DOC001',
            'department': 'Cardiology',
            'salary': 150000,
            'phone': '8888888888',
            'address': 'Doctor Chamber',
            'createdAt': datetime.now()
        })
        print('✅ Doctor created: doctor/doctor123')
    
    # Nurse
    if not UserModel.find_by_username('nurse'):
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw('nurse123'.encode('utf-8'), salt)
        UserModel.collection.insert_one({
            'username': 'nurse',
            'password': hashed,
            'email': 'nurse@wastewatch.com',
            'fullName': 'Nurse Emily Brown',
            'role': 'nurse',
            'employeeId': 'NURSE001',
            'department': 'ICU',
            'salary': 60000,
            'phone': '7777777777',
            'address': 'Nurse Station',
            'createdAt': datetime.now()
        })
        print('✅ Nurse created: nurse/nurse123')
    
    # Manager
    if not UserModel.find_by_username('manager'):
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw('manager123'.encode('utf-8'), salt)
        UserModel.collection.insert_one({
            'username': 'manager',
            'password': hashed,
            'email': 'manager@wastewatch.com',
            'fullName': 'Manager Michael Scott',
            'role': 'manager',
            'employeeId': 'MGR001',
            'department': 'Administration',
            'salary': 120000,
            'phone': '6666666666',
            'address': 'Manager Office',
            'createdAt': datetime.now()
        })
        print('✅ Manager created: manager/manager123')
def create_sample_data():
    """Create sample data for all collections"""
    from datetime import datetime, timedelta
    
    print("📦 Creating sample data...")
    
    # ========== 1. SAMPLE MEDICINES ==========
    medicines = [
        {'name': 'Amoxicillin', 'category': 'Antibiotic', 'manufacturer': 'Cipla', 'reorderLevel': 100},
        {'name': 'Paracetamol', 'category': 'Analgesic', 'manufacturer': 'GSK', 'reorderLevel': 200},
        {'name': 'Insulin', 'category': 'Diabetes', 'manufacturer': 'Lily', 'reorderLevel': 50},
        {'name': 'Metformin', 'category': 'Diabetes', 'manufacturer': 'Sun Pharma', 'reorderLevel': 150},
        {'name': 'Atorvastatin', 'category': 'Cardiac', 'manufacturer': 'Pfizer', 'reorderLevel': 80},
        {'name': 'Omeprazole', 'category': 'Gastric', 'manufacturer': 'AstraZeneca', 'reorderLevel': 100},
        {'name': 'Ciprofloxacin', 'category': 'Antibiotic', 'manufacturer': 'Bayer', 'reorderLevel': 120},
        {'name': 'Diazepam', 'category': 'Neurology', 'manufacturer': 'Roche', 'reorderLevel': 30},
    ]
    
    medicine_ids = {}
    for med in medicines:
        existing = db.medicines.find_one({'name': med['name']})
        if not existing:
            result = db.medicines.insert_one(med)
            medicine_ids[med['name']] = str(result.inserted_id)
            print(f"  ✅ Added medicine: {med['name']}")
        else:
            medicine_ids[med['name']] = str(existing['_id'])
    
    # ========== 2. SAMPLE BATCHES ==========
    today = datetime.now()
    batches = [
        {'medicineName': 'Amoxicillin', 'batchNumber': 'AMX001', 'quantity': 500, 'price': 5.00, 
         'expiryDate': today + timedelta(days=15), 'supplier': 'MediSupply', 'dailyUsage': 30},
        {'medicineName': 'Amoxicillin', 'batchNumber': 'AMX002', 'quantity': 800, 'price': 5.00, 
         'expiryDate': today + timedelta(days=45), 'supplier': 'MediSupply', 'dailyUsage': 30},
        {'medicineName': 'Paracetamol', 'batchNumber': 'PAR001', 'quantity': 1000, 'price': 2.50, 
         'expiryDate': today + timedelta(days=10), 'supplier': 'HealthCorp', 'dailyUsage': 50},
        {'medicineName': 'Paracetamol', 'batchNumber': 'PAR002', 'quantity': 600, 'price': 2.50, 
         'expiryDate': today + timedelta(days=60), 'supplier': 'HealthCorp', 'dailyUsage': 50},
        {'medicineName': 'Insulin', 'batchNumber': 'INS001', 'quantity': 200, 'price': 15.00, 
         'expiryDate': today + timedelta(days=20), 'supplier': 'PharmaCorp', 'dailyUsage': 10},
        {'medicineName': 'Insulin', 'batchNumber': 'INS002', 'quantity': 150, 'price': 15.00, 
         'expiryDate': today + timedelta(days=90), 'supplier': 'PharmaCorp', 'dailyUsage': 10},
        {'medicineName': 'Metformin', 'batchNumber': 'MET001', 'quantity': 800, 'price': 3.00, 
         'expiryDate': today + timedelta(days=70), 'supplier': 'Sun Pharma', 'dailyUsage': 25},
        {'medicineName': 'Atorvastatin', 'batchNumber': 'ATO001', 'quantity': 300, 'price': 4.50, 
         'expiryDate': today + timedelta(days=120), 'supplier': 'Pfizer', 'dailyUsage': 8},
        {'medicineName': 'Omeprazole', 'batchNumber': 'OME001', 'quantity': 600, 'price': 3.75, 
         'expiryDate': today + timedelta(days=140), 'supplier': 'AstraZeneca', 'dailyUsage': 15},
        {'medicineName': 'Ciprofloxacin', 'batchNumber': 'CIP001', 'quantity': 400, 'price': 8.00, 
         'expiryDate': today + timedelta(days=35), 'supplier': 'Bayer', 'dailyUsage': 20},
        {'medicineName': 'Diazepam', 'batchNumber': 'DIA001', 'quantity': 100, 'price': 12.00, 
         'expiryDate': today + timedelta(days=180), 'supplier': 'Roche', 'dailyUsage': 5},
    ]
    
    for batch in batches:
        existing = db.batches.find_one({'batchNumber': batch['batchNumber']})
        if not existing:
            db.batches.insert_one(batch)
            print(f"  ✅ Added batch: {batch['batchNumber']} - {batch['medicineName']}")
    
    # ========== 3. SAMPLE RESEARCH ARTICLES ==========
    research_articles = [
        {
            'title': 'New Study on Amoxicillin Efficacy',
            'content': 'Recent study shows improved outcomes with extended course of Amoxicillin in respiratory infections...',
            'authorId': 'DOC001',
            'authorName': 'Dr. Sarah Wilson',
            'status': 'published',
            'views': 245,
            'likes': 32,
            'comments': [
                {'userId': 'DOC002', 'text': 'Great research! Any plans for pediatric trials?', 'createdAt': datetime.now()}
            ],
            'createdAt': datetime.now() - timedelta(days=5)
        },
        {
            'title': 'Insulin Storage Best Practices',
            'content': 'Proper temperature control for insulin storage can extend shelf life by up to 30%...',
            'authorId': 'DOC003',
            'authorName': 'Dr. James Wilson',
            'status': 'published',
            'views': 189,
            'likes': 45,
            'comments': [],
            'createdAt': datetime.now() - timedelta(days=10)
        },
        {
            'title': 'Antibiotic Resistance Trends 2026',
            'content': 'Analysis of antibiotic resistance patterns in ICU patients shows concerning trends...',
            'authorId': 'DOC001',
            'authorName': 'Dr. Sarah Wilson',
            'status': 'published',
            'views': 567,
            'likes': 89,
            'comments': [
                {'userId': 'DOC004', 'text': 'Important findings for our department!', 'createdAt': datetime.now()}
            ],
            'createdAt': datetime.now() - timedelta(days=15)
        }
    ]
    
    for article in research_articles:
        existing = db.research.find_one({'title': article['title']})
        if not existing:
            db.research.insert_one(article)
            print(f"  ✅ Added research: {article['title']}")
    
    # ========== 4. SAMPLE PAYROLL ==========
    payroll_records = [
        {'employeeId': 'ADMIN001', 'employeeName': 'System Administrator', 'department': 'Administration', 
         'month': 'April 2026', 'amount': 100000, 'status': 'paid', 'createdAt': datetime.now()},
        {'employeeId': 'DOC001', 'employeeName': 'Dr. Sarah Wilson', 'department': 'Cardiology', 
         'month': 'April 2026', 'amount': 150000, 'status': 'paid', 'createdAt': datetime.now()},
        {'employeeId': 'DOC002', 'employeeName': 'Dr. James Wilson', 'department': 'Neurology', 
         'month': 'April 2026', 'amount': 145000, 'status': 'pending', 'createdAt': datetime.now()},
        {'employeeId': 'NURSE001', 'employeeName': 'Nurse Emily Brown', 'department': 'ICU', 
         'month': 'April 2026', 'amount': 60000, 'status': 'pending', 'createdAt': datetime.now()},
        {'employeeId': 'NURSE002', 'employeeName': 'Nurse John Doe', 'department': 'Emergency', 
         'month': 'April 2026', 'amount': 58000, 'status': 'pending', 'createdAt': datetime.now()},
        {'employeeId': 'MGR001', 'employeeName': 'Manager Michael Scott', 'department': 'Administration', 
         'month': 'April 2026', 'amount': 120000, 'status': 'paid', 'createdAt': datetime.now()},
        {'employeeId': 'PHARM001', 'employeeName': 'Pharmacist Lisa Wong', 'department': 'Pharmacy', 
         'month': 'April 2026', 'amount': 55000, 'status': 'pending', 'createdAt': datetime.now()},
    ]
    
    for payroll in payroll_records:
        existing = db.payroll.find_one({'employeeId': payroll['employeeId'], 'month': payroll['month']})
        if not existing:
            db.payroll.insert_one(payroll)
            print(f"  ✅ Added payroll: {payroll['employeeName']} - {payroll['amount']}")
    
    # ========== 5. SAMPLE TASKS FOR CHECKLIST ==========
    today_str = datetime.now().strftime('%Y-%m-%d')
    
    tasks = [
        {'task': 'Use Amoxicillin batch AMX001 first (expires in 15 days)', 'category': 'medication', 
         'priority': 'high', 'shift': 'morning', 'date': today_str, 'completed': False},
        {'task': 'Check refrigerator temperatures in ICU', 'category': 'expiry', 
         'priority': 'high', 'shift': 'morning', 'date': today_str, 'completed': False},
        {'task': 'ICU Round with Dr. Sharma', 'category': 'ward', 
         'priority': 'medium', 'shift': 'morning', 'date': today_str, 'completed': False},
        {'task': 'Restock emergency department medicines', 'category': 'medication', 
         'priority': 'medium', 'shift': 'evening', 'date': today_str, 'completed': False},
        {'task': 'Count controlled substances in pharmacy', 'category': 'inventory', 
         'priority': 'high', 'shift': 'evening', 'date': today_str, 'completed': False},
        {'task': 'Prepare morning medications for ICU', 'category': 'medication', 
         'priority': 'medium', 'shift': 'night', 'date': today_str, 'completed': False},
        {'task': 'Check all expiry dates for next week', 'category': 'expiry', 
         'priority': 'high', 'shift': 'night', 'date': today_str, 'completed': False},
    ]
    
    for task in tasks:
        existing = db.tasks.find_one({'task': task['task'], 'date': task['date']})
        if not existing:
            db.tasks.insert_one(task)
            print(f"  ✅ Added task: {task['task']}")
    
    print("=" * 50)
    print("✅ SAMPLE DATA CREATED SUCCESSFULLY!")
    print("=" * 50)
    print(f"📦 Medicines: {db.medicines.count_documents({})}")
    print(f"🏷️  Batches: {db.batches.count_documents({})}")
    print(f"📝 Research: {db.research.count_documents({})}")
    print(f"💰 Payroll: {db.payroll.count_documents({})}")
    print(f"✅ Tasks: {db.tasks.count_documents({})}")
    print("=" * 50)
if __name__ == '__main__':
    create_default_users()
    create_sample_data()
    print('=' * 60)
    print('🚀 WASTEWATCH PRO SERVER STARTING...')
    print('=' * 60)
    print('📍 Server: http://localhost:5000')
    print('🔑 Login Credentials:')
    print('   Admin:   admin / admin123')
    print('   Doctor:  doctor / doctor123')
    print('   Nurse:   nurse / nurse123')
    print('   Manager: manager / manager123')
    print('=' * 60)
    app.run(debug=True, port=5000)