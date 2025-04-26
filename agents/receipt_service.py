from sqlalchemy.orm import Session
from models import Receipt, ReceiptItem, Category
from datetime import date
from sqlalchemy import func
import logging

class ReceiptService:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def get_all_receipts(self, date_from: date = None, date_to: date = None):
        query = self.db_session.query(Receipt).join(Receipt.items).join(ReceiptItem.category)

        if date_from:
            query = query.filter(Receipt.purchase_date >= date_from)
        if date_to:
            query = query.filter(Receipt.purchase_date <= date_to)

        return query.order_by(Receipt.purchase_date.desc()).all()

    def get_receipt_by_id(self, receipt_id):
        receipt = self.db_session.query(Receipt).filter(Receipt.id == receipt_id).first()
        if not receipt:
            raise ValueError("Receipt not found")
        return receipt

    def get_spending_by_category(self, category_name, start_date: date = None, end_date: date = None):
        logging.info(f"Querying database for category: {category_name}, start_date: {start_date}, end_date: {end_date}")

        # Ensure the join logic reflects the actual relationships
        query = self.db_session.query(func.sum(ReceiptItem.price)).join(Receipt).join(Category).filter(Category.name == category_name)

        if start_date:
            query = query.filter(Receipt.purchase_date >= start_date)
        if end_date:
            query = query.filter(Receipt.purchase_date <= end_date)

        result = query.scalar() or 0
        logging.info(f"Database response for category '{category_name}': {result}")
        return result

    def get_spending_by_date(self, specific_date: date):
        return self.db_session.query(func.sum(Receipt.total_amount)).filter(Receipt.purchase_date == specific_date).scalar() or 0

    def search_receipts(self, search_query):
        return self.db_session.query(Receipt).join(Receipt.items).join(ReceiptItem.category).filter(
            (Receipt.store_name.contains(search_query)) |
            (ReceiptItem.name.contains(search_query)) |
            (Category.name.contains(search_query))
        ).all()

    def get_last_receipt_containing_keyword(self, keyword):
        return self.db_session.query(Receipt).join(Receipt.items).join(ReceiptItem.category).filter(
            (Receipt.store_name.contains(keyword)) |
            (ReceiptItem.name.contains(keyword)) |
            (Category.name.contains(keyword))
        ).order_by(Receipt.purchase_date.desc()).first()

# Example usage:
# from database import SessionLocal
# db_session = SessionLocal()
# receipt_service = ReceiptService(db_session)
# receipts = receipt_service.get_all_receipts()
