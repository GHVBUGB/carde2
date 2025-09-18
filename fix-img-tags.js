const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/components/card/business-card-preview.tsx',
  'src/components/card/clean-draggable-card.tsx',
  'src/components/card/draggable-business-card-preview.tsx',
  'src/components/card/improved-business-card-preview.tsx',
  'src/components/dashboard/nav.tsx',
  'src/components/editor/avatar-upload.tsx'
];

// 修复函数
function fixImgTags(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否已经导入了Image组件
    if (!content.includes("import Image from 'next/image'")) {
      // 在第一个import后添加Image导入
      content = content.replace(
        /(import.*from.*['"]next\/link['"];?\s*)/,
        '$1import Image from \'next/image\'\n'
      );
    }
    
    // 替换img标签为Image组件
    content = content.replace(
      /<img\s+([^>]*?)src={([^}]+)}\s+([^>]*?)alt={([^}]+)}\s+([^>]*?)className="([^"]*?)"\s*\/>/g,
      '<Image $1src={$2} $3alt={$4} $5className="$6" width={32} height={32} />'
    );
    
    // 处理其他img标签变体
    content = content.replace(
      /<img\s+([^>]*?)src={([^}]+)}\s+([^>]*?)alt={([^}]+)}\s+([^>]*?)\/>/g,
      '<Image $1src={$2} $3alt={$4} $5width={32} height={32} />'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// 执行修复
filesToFix.forEach(fixImgTags);
console.log('Image tag fixes completed!');
