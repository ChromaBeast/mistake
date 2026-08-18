#!/usr/bin/env python3
"""
Firebase Blog Automation Database Setup Script
This script helps set up and manage the Firebase Firestore database
for the n8n car blog automation workflow.
"""

import json
import argparse
from datetime import datetime, timezone
from typing import List, Dict, Optional
import random
import time

# Firebase Admin SDK
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("Please install firebase-admin: pip install firebase-admin")
    exit(1)


class BlogDatabaseManager:
    """Manages the Firebase Firestore database for blog automation"""
    
    def __init__(self, service_account_path: str):
        """
        Initialize Firebase connection
        
        Args:
            service_account_path: Path to Firebase service account JSON file
        """
        try:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print("✅ Connected to Firebase successfully!")
        except Exception as e:
            print(f"❌ Failed to connect to Firebase: {e}")
            exit(1)
    
    def get_sample_topics(self) -> List[Dict]:
        """Generate sample blog topics"""
        topics = [
            {
                "topic": "2024 Electric SUV Comparison: Tesla Model Y vs BMW iX vs Genesis GV70",
                "status": "pending",
                "priority": 5,
                "keywords": ["electric SUV", "Tesla Model Y", "BMW iX", "Genesis GV70", "EV comparison"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "The Rise of Chinese EV Manufacturers in Global Markets",
                "status": "pending",
                "priority": 4,
                "keywords": ["Chinese EV", "BYD", "Nio", "Xpeng", "electric vehicles", "global market"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "Hybrid vs Plug-in Hybrid: Which is Right for You in 2024?",
                "status": "pending",
                "priority": 3,
                "keywords": ["hybrid cars", "PHEV", "fuel efficiency", "car buying guide"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "Self-Driving Technology: Current State and Future Predictions",
                "status": "pending",
                "priority": 5,
                "keywords": ["autonomous vehicles", "self-driving", "Tesla FSD", "Waymo", "AI driving"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "Best Performance Cars Under $50,000 in 2024",
                "status": "pending",
                "priority": 4,
                "keywords": ["performance cars", "sports cars", "affordable performance", "car reviews"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "The Truth About EV Battery Life and Replacement Costs",
                "status": "pending",
                "priority": 5,
                "keywords": ["EV battery", "battery degradation", "replacement cost", "electric vehicle maintenance"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "Solid-State Batteries: The Next Revolution in Electric Vehicles",
                "status": "pending",
                "priority": 4,
                "keywords": ["solid-state battery", "EV technology", "battery innovation", "Toyota", "QuantumScape"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "Vehicle-to-Grid Technology: Turning Your Car into a Power Bank",
                "status": "pending",
                "priority": 3,
                "keywords": ["V2G", "vehicle-to-grid", "bidirectional charging", "energy storage"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "The Impact of AI on Modern Vehicle Safety Systems",
                "status": "pending",
                "priority": 4,
                "keywords": ["AI safety", "ADAS", "collision avoidance", "driver assistance"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            },
            {
                "topic": "Hydrogen vs Electric: Which is the True Future of Clean Transportation?",
                "status": "pending",
                "priority": 5,
                "keywords": ["hydrogen cars", "fuel cell", "electric vehicles", "clean energy", "Toyota Mirai"],
                "createdAt": datetime.now(timezone.utc),
                "processedAt": None,
                "blogId": None
            }
        ]
        return topics
    
    def get_sample_blogs(self) -> List[Dict]:
        """Generate sample blog posts for context"""
        blogs = [
            {
                "title": "The Evolution of Electric Vehicle Charging Infrastructure",
                "content": "As electric vehicles become mainstream, the charging infrastructure has evolved dramatically. From the early days of sparse Level 2 chargers to today's extensive network of DC fast chargers, the landscape has transformed. Major players like Tesla's Supercharger network, Electrify America, and ChargePoint have created a robust ecosystem...",
                "summary": "An in-depth look at how EV charging networks are expanding globally and what it means for EV adoption.",
                "status": "published",
                "author": "AI Content Generator",
                "category": "Automotive",
                "tags": ["electric vehicles", "charging", "infrastructure", "technology"],
                "topicId": "sample_001",
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc),
                "views": random.randint(100, 1000),
                "seoMeta": {
                    "description": "Explore the rapid evolution of EV charging infrastructure",
                    "keywords": ["EV charging", "electric cars", "charging stations"]
                }
            },
            {
                "title": "Top 10 Fuel-Efficient Cars for City Driving",
                "content": "Urban drivers face unique challenges when it comes to fuel efficiency. Stop-and-go traffic, frequent short trips, and limited parking all impact fuel consumption. We've analyzed the latest models to find the most efficient options for city dwellers...",
                "summary": "Discover the most fuel-efficient vehicles perfect for city commuting and urban environments.",
                "status": "published",
                "author": "AI Content Generator",
                "category": "Automotive",
                "tags": ["fuel efficiency", "city cars", "economy", "reviews"],
                "topicId": "sample_002",
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc),
                "views": random.randint(100, 1000),
                "seoMeta": {
                    "description": "Find the best fuel-efficient cars for city driving",
                    "keywords": ["fuel efficient cars", "city driving", "economy cars"]
                }
            },
            {
                "title": "Understanding ADAS: How Advanced Driver Assistance Systems Work",
                "content": "Advanced Driver Assistance Systems (ADAS) have revolutionized vehicle safety. Features like adaptive cruise control, lane keeping assist, and automatic emergency braking are becoming standard...",
                "summary": "A comprehensive guide to understanding modern driver assistance technologies and their impact on road safety.",
                "status": "published",
                "author": "AI Content Generator",
                "category": "Automotive",
                "tags": ["ADAS", "safety", "technology", "driver assistance"],
                "topicId": "sample_003",
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc),
                "views": random.randint(100, 1000),
                "seoMeta": {
                    "description": "Learn how ADAS technology is making driving safer",
                    "keywords": ["ADAS", "driver assistance", "car safety", "autonomous features"]
                }
            }
        ]
        return blogs
    
    def setup_database(self):
        """Set up the initial database with collections and sample data"""
        print("\n📦 Setting up Firebase database...")
        
        # Add blog topics
        print("\n📝 Adding blog topics...")
        topics = self.get_sample_topics()
        topics_ref = self.db.collection('blogTopics')
        
        for topic in topics:
            doc_ref = topics_ref.add(topic)
            print(f"  ✅ Added topic: {topic['topic'][:50]}...")
            time.sleep(0.1)  # Avoid rate limiting
        
        # Add sample blogs
        print("\n📚 Adding sample blogs for context...")
        blogs = self.get_sample_blogs()
        blogs_ref = self.db.collection('blogs')
        
        for blog in blogs:
            doc_ref = blogs_ref.add(blog)
            print(f"  ✅ Added blog: {blog['title']}")
            time.sleep(0.1)
        
        print("\n🎉 Database setup complete!")
        self.show_stats()
    
    def show_stats(self):
        """Display current database statistics"""
        print("\n📊 Database Statistics:")
        
        # Count topics
        topics_ref = self.db.collection('blogTopics')
        pending_topics = topics_ref.where('status', '==', 'pending').get()
        completed_topics = topics_ref.where('status', '==', 'completed').get()
        
        print(f"  📝 Blog Topics:")
        print(f"     • Pending: {len(pending_topics)}")
        print(f"     • Completed: {len(completed_topics)}")
        
        # Count blogs
        blogs_ref = self.db.collection('blogs')
        all_blogs = blogs_ref.get()
        published_blogs = blogs_ref.where('status', '==', 'published').get()
        
        print(f"  📚 Blog Posts:")
        print(f"     • Total: {len(all_blogs)}")
        print(f"     • Published: {len(published_blogs)}")
    
    def add_topics(self, topics_file: Optional[str] = None):
        """Add topics from a JSON file or interactively"""
        if topics_file:
            with open(topics_file, 'r') as f:
                topics = json.load(f)
        else:
            topics = []
            print("\n➕ Add new topics (enter empty line to finish):")
            while True:
                topic = input("Topic: ").strip()
                if not topic:
                    break
                
                priority = input("Priority (1-5, default 3): ").strip()
                priority = int(priority) if priority else 3
                
                keywords = input("Keywords (comma-separated): ").strip()
                keywords = [k.strip() for k in keywords.split(',')] if keywords else []
                
                topics.append({
                    "topic": topic,
                    "status": "pending",
                    "priority": priority,
                    "keywords": keywords,
                    "createdAt": datetime.now(timezone.utc),
                    "processedAt": None,
                    "blogId": None
                })
        
        # Add topics to database
        topics_ref = self.db.collection('blogTopics')
        for topic in topics:
            topics_ref.add(topic)
            print(f"✅ Added: {topic['topic'][:50]}...")
        
        print(f"\n✅ Added {len(topics)} topics successfully!")
    
    def list_topics(self, status: str = "all"):
        """List topics by status"""
        topics_ref = self.db.collection('blogTopics')
        
        if status != "all":
            topics = topics_ref.where('status', '==', status).order_by('priority', direction=firestore.Query.DESCENDING).get()
        else:
            topics = topics_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).get()
        
        print(f"\n📋 Topics ({status}):")
        print("-" * 80)
        
        for doc in topics:
            topic = doc.to_dict()
            print(f"ID: {doc.id[:8]}...")
            print(f"Topic: {topic['topic']}")
            print(f"Status: {topic['status']} | Priority: {topic.get('priority', 'N/A')}")
            print(f"Keywords: {', '.join(topic.get('keywords', []))}")
            print("-" * 80)
        
        print(f"\nTotal: {len(topics)} topics")
    
    def list_blogs(self, limit: int = 10):
        """List recent blog posts"""
        blogs_ref = self.db.collection('blogs')
        blogs = blogs_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).limit(limit).get()
        
        print(f"\n📚 Recent Blogs (latest {limit}):")
        print("-" * 80)
        
        for doc in blogs:
            blog = doc.to_dict()
            print(f"ID: {doc.id[:8]}...")
            print(f"Title: {blog['title']}")
            print(f"Status: {blog['status']} | Views: {blog.get('views', 0)}")
            print(f"Created: {blog['createdAt'].strftime('%Y-%m-%d %H:%M')}")
            print(f"Tags: {', '.join(blog.get('tags', []))}")
            print("-" * 80)
        
        print(f"\nTotal shown: {len(blogs)} blogs")
    
    def reset_topic_status(self, topic_id: str):
        """Reset a topic status back to pending"""
        topics_ref = self.db.collection('blogTopics')
        topics_ref.document(topic_id).update({
            'status': 'pending',
            'processedAt': None,
            'blogId': None
        })
        print(f"✅ Reset topic {topic_id} to pending status")
    
    def cleanup_old_blogs(self, days: int = 180):
        """Archive blogs older than specified days"""
        from datetime import timedelta
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        blogs_ref = self.db.collection('blogs')
        
        old_blogs = blogs_ref.where('createdAt', '<', cutoff_date).get()
        
        print(f"\n🗑️  Found {len(old_blogs)} blogs older than {days} days")
        
        if old_blogs:
            confirm = input("Archive these blogs? (y/n): ")
            if confirm.lower() == 'y':
                for doc in old_blogs:
                    doc.reference.update({'status': 'archived'})
                print(f"✅ Archived {len(old_blogs)} blogs")
    
    def export_data(self, output_file: str = "firebase_backup.json"):
        """Export all data to JSON file"""
        print(f"\n💾 Exporting data to {output_file}...")
        
        data = {
            "blogTopics": [],
            "blogs": [],
            "exported_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Export topics
        topics = self.db.collection('blogTopics').get()
        for doc in topics:
            topic = doc.to_dict()
            topic['id'] = doc.id
            # Convert datetime objects
            if topic.get('createdAt'):
                topic['createdAt'] = topic['createdAt'].isoformat()
            if topic.get('processedAt'):
                topic['processedAt'] = topic['processedAt'].isoformat()
            data['blogTopics'].append(topic)
        
        # Export blogs
        blogs = self.db.collection('blogs').get()
        for doc in blogs:
            blog = doc.to_dict()
            blog['id'] = doc.id
            # Convert datetime objects
            if blog.get('createdAt'):
                blog['createdAt'] = blog['createdAt'].isoformat()
            if blog.get('updatedAt'):
                blog['updatedAt'] = blog['updatedAt'].isoformat()
            data['blogs'].append(blog)
        
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        print(f"✅ Exported {len(data['blogTopics'])} topics and {len(data['blogs'])} blogs")


def main():
    """Main function to handle command line arguments"""
    parser = argparse.ArgumentParser(description='Firebase Blog Database Manager')
    parser.add_argument('--service-account', required=True, help='Path to Firebase service account JSON file')
    parser.add_argument('--action', choices=[
        'setup', 'stats', 'add-topics', 'list-topics', 'list-blogs', 
        'reset-topic', 'cleanup', 'export'
    ], required=True, help='Action to perform')
    parser.add_argument('--status', default='all', help='Filter by status (for list-topics)')
    parser.add_argument('--limit', type=int, default=10, help='Limit number of results')
    parser.add_argument('--topic-id', help='Topic ID for reset action')
    parser.add_argument('--topics-file', help='JSON file with topics to import')
    parser.add_argument('--days', type=int, default=180, help='Days threshold for cleanup')
    parser.add_argument('--output', default='firebase_backup.json', help='Output file for export')
    
    args = parser.parse_args()
    
    # Initialize manager
    manager = BlogDatabaseManager(args.service_account)
    
    # Perform action
    if args.action == 'setup':
        manager.setup_database()
    elif args.action == 'stats':
        manager.show_stats()
    elif args.action == 'add-topics':
        manager.add_topics(args.topics_file)
    elif args.action == 'list-topics':
        manager.list_topics(args.status)
    elif args.action == 'list-blogs':
        manager.list_blogs(args.limit)
    elif args.action == 'reset-topic':
        if not args.topic_id:
            print("❌ Please provide --topic-id for reset action")
        else:
            manager.reset_topic_status(args.topic_id)
    elif args.action == 'cleanup':
        manager.cleanup_old_blogs(args.days)
    elif args.action == 'export':
        manager.export_data(args.output)


if __name__ == "__main__":
    main()
