from sqlalchemy import Column, String, Integer, Float, ForeignKey, Date, Table
from sqlalchemy.orm import relationship, declarative_base
import uuid

Base = declarative_base()

class Receipt(Base):
    __tablename__ = 'receipts'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_name = Column(String, nullable=False)
    purchase_date = Column(Date, nullable=False)
    total_amount = Column(Float, nullable=False)

    items = relationship("ReceiptItem", back_populates="receipt")

class ReceiptItem(Base):
    __tablename__ = 'receipt_items'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    receipt_id = Column(String, ForeignKey('receipts.id'), nullable=False)
    category_id = Column(String, ForeignKey('categories.id'), nullable=True)

    receipt = relationship("Receipt", back_populates="items")
    category = relationship("Category", back_populates="items")

class Category(Base):
    __tablename__ = 'categories'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    items = relationship("ReceiptItem", back_populates="category")
