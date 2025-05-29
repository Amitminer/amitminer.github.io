## 🎯 **What Does It Actually Measure?**

The skills percentages represent **how much code you've written in each programming language** across your GitHub repositories, measured in bytes of source code.

## 📊 **The Calculation Process**

### Step 1: Repository Selection
- Fetches all your public GitHub repositories
- **Filters out:**
  - Forked repositories (copies of other people's code)
  - Empty repositories (size = 0)
  - Old repositories (not updated in the last year)
- **Keeps only:**
  - Top 20 largest repositories by size
  - Recently active projects
  - Your original work

### Step 2: Language Data Collection
For each selected repository, GitHub provides language statistics like:
```
JavaScript: 45,230 bytes
Python: 23,450 bytes
CSS: 12,100 bytes
HTML: 8,920 bytes
```

### Step 3: Aggregation
Combines all the bytes from all repositories:
```
Total JavaScript across all repos: 245,830 bytes
Total Python across all repos: 123,450 bytes
Total CSS across all repos: 89,100 bytes
etc...
```

### Step 4: Top Languages Selection
- Takes only the **top 6 languages** by total bytes
- Ignores smaller languages to keep the display clean

### Step 5: Percentage Calculation
Calculates what percentage each language represents of your top 6:
```
JavaScript: 245,830 bytes = 45% of top 6 languages
Python: 123,450 bytes = 23% of top 6 languages
CSS: 89,100 bytes = 16% of top 6 languages
etc...
```

## 🤔 **What This Means**

### ✅ **Good Indicators:**
- **Recent coding activity** (only counts last year)
- **Original work** (excludes forks)
- **Substantial projects** (ignores tiny repos)
- **Relative usage** across your main projects

### ❌ **Limitations:**
- **Not skill level** - just volume of code written
- **Doesn't count private repos** (unless API has access)
- **File size bias** - verbose languages appear higher
- **Recent bias** - old projects (1+ years) are ignored
- **No quality measurement** - 1000 lines of bad code = 1000 lines of good code

## 🎯 **Real-World Example**

If you have:
- 3 React projects (lots of JavaScript/TypeScript)
- 2 Python data science projects  
- 1 C++ game project

You might see:
- **JavaScript: 40%** (React apps tend to have many files)
- **Python: 35%** (Data science with libraries)
- **TypeScript: 15%** (Type definitions add up)
- **C++: 8%** (Usually more concise)
- **CSS: 2%** (Styling files)

## 💡 **Bottom Line**

Think of it as **"What languages do I write the most code in?"** rather than **"How good am I at these languages?"**