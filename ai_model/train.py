"""
AI Model Training Script — CROOPIC
─────────────────────────────────────────────────────────────────
Train EfficientNet-B4 (or any timm model) on PlantVillage dataset.

Usage:
  python train.py --arch efficientnet_b4 --data_dir ./data/PlantVillage --epochs 30

Dataset: PlantVillage (38 classes, 54k images)
Download: https://www.kaggle.com/datasets/emmarex/plantdisease
"""

import argparse
import os
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import timm
from tqdm import tqdm


def get_transforms(img_size=224):
    train_tf = transforms.Compose([
        transforms.Resize((img_size + 32, img_size + 32)),
        transforms.RandomCrop(img_size),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    return train_tf, val_tf


def build_model(arch: str, num_classes: int):
    model = timm.create_model(arch, pretrained=True, num_classes=num_classes)
    return model


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on: {device}")

    train_tf, val_tf = get_transforms(args.img_size)
    data_dir = Path(args.data_dir)

    train_ds = datasets.ImageFolder(data_dir / "train", transform=train_tf)
    val_ds   = datasets.ImageFolder(data_dir / "val",   transform=val_tf)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True,  num_workers=4, pin_memory=True)
    val_loader   = DataLoader(val_ds,   batch_size=args.batch_size, shuffle=False, num_workers=4, pin_memory=True)

    num_classes = len(train_ds.classes)
    print(f"Classes: {num_classes} — {train_ds.classes[:5]}...")

    model = build_model(args.arch, num_classes).to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    best_acc = 0.0
    weights_dir = Path("weights")
    weights_dir.mkdir(exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        # ── Train ────────────────────────────────────────────
        model.train()
        train_loss, train_correct = 0.0, 0
        for imgs, labels in tqdm(train_loader, desc=f"Epoch {epoch}/{args.epochs} [Train]"):
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            train_loss    += loss.item() * imgs.size(0)
            train_correct += (outputs.argmax(1) == labels).sum().item()

        # ── Validate ─────────────────────────────────────────
        model.eval()
        val_correct = 0
        with torch.no_grad():
            for imgs, labels in tqdm(val_loader, desc=f"Epoch {epoch}/{args.epochs} [Val]"):
                imgs, labels = imgs.to(device), labels.to(device)
                outputs = model(imgs)
                val_correct += (outputs.argmax(1) == labels).sum().item()

        train_acc = train_correct / len(train_ds)
        val_acc   = val_correct   / len(val_ds)
        scheduler.step()

        print(f"  → Train Acc: {train_acc:.4f} | Val Acc: {val_acc:.4f}")

        if val_acc > best_acc:
            best_acc = val_acc
            save_path = weights_dir / f"croopic_model.pt"
            torch.save(model.state_dict(), save_path)
            print(f"  ✅ Best model saved → {save_path} (Val Acc: {val_acc:.4f})")

    print(f"\n🎯 Training complete. Best Val Accuracy: {best_acc:.4f}")

    # Save class labels
    import json
    labels_path = weights_dir / "class_labels.json"
    with open(labels_path, "w") as f:
        json.dump(train_ds.classes, f, indent=2)
    print(f"📋 Class labels saved → {labels_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CROOPIC Model Training")
    parser.add_argument("--arch",       type=str,   default="efficientnet_b4")
    parser.add_argument("--data_dir",   type=str,   default="./data/PlantVillage")
    parser.add_argument("--epochs",     type=int,   default=30)
    parser.add_argument("--batch_size", type=int,   default=32)
    parser.add_argument("--lr",         type=float, default=3e-4)
    parser.add_argument("--img_size",   type=int,   default=224)
    args = parser.parse_args()
    train(args)
