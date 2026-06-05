import re
import os

def main():
    # 1. Read PAGE_CODES from usePagePermissions.js
    with open('/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-frontend/src/hooks/usePagePermissions.js', 'r') as f:
        perm_content = f.read()
    
    page_codes_block = re.search(r'export const PAGE_CODES = \{(.*?)\};', perm_content, re.DOTALL)
    page_codes = {}
    if page_codes_block:
        block = page_codes_block.group(1)
        for line in block.split('\n'):
            line = line.strip()
            if not line or line.startswith('//'):
                continue
            match = re.match(r'([A-Z0-9_]+):\s*\'([A-Z0-9_]+)\'', line)
            if match:
                page_codes[match.group(1)] = match.group(2)

    # Convert code -> constant name
    code_to_const = {v: k for k, v in page_codes.items()}

    # 2. Collect all menu items from erp.js and admin.js
    menu_items = []
    menu_dir = '/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-frontend/src/menu-items'
    for fn in os.listdir(menu_dir):
        if not fn.endswith('.js') and not fn.endswith('.jsx'):
            continue
        with open(os.path.join(menu_dir, fn), 'r') as f:
            content = f.read()
        
        # Regex to find item definitions
        # e.g., url: '/master/sales/logistics/uom', and pageCode: 'M5240'
        items = re.findall(r'id:\s*\'([^\'\s]+)\'.*?url:\s*\'([^\'\s]+)\'.*?pageCode:\s*\'([^\'\s]+)\'', content, re.DOTALL)
        for item_id, url, page_code in items:
            menu_items.append({
                'id': item_id,
                'url': url,
                'pageCode': page_code,
                'file': fn
            })

    print(f"Loaded {len(menu_items)} menu items with pageCodes from menu-items/")

    # 3. Read MainRoutes.jsx
    with open('/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-frontend/src/routes/MainRoutes.jsx', 'r') as f:
        routes_content = f.read()

    # Find all path blocks in MainRoutes
    # e.g., path: '/master/npd/wind-farm', element: <PageGuard ...>
    path_blocks = re.findall(r'path:\s*\'([^\'\s]+)\',\s*element:\s*([^\n]+)', routes_content)
    routes = {}
    for path, element in path_blocks:
        # Strip trailing comma
        element = element.strip().rstrip(',')
        routes[path] = element

    print(f"Loaded {len(routes)} routes from MainRoutes.jsx")

    # 4. Analyze Menu items vs Routes
    unlinked_menu_items = []
    missing_guards = []
    incorrect_guards = []

    for item in menu_items:
        url = item['url']
        page_code = item['pageCode']
        
        # Check if URL exists in routes
        if url not in routes:
            unlinked_menu_items.append(item)
            continue
        
        element = routes[url]
        # Check if wrapped in PageGuard
        guard_match = re.search(r'PageGuard\s+pageCode=\{PAGE_CODES\.([A-Z0-9_]+)\}', element)
        if not guard_match:
            missing_guards.append((url, page_code, element))
        else:
            const_name = guard_match.group(1)
            expected_const = code_to_const.get(page_code, None)
            if expected_const != const_name:
                incorrect_guards.append((url, page_code, const_name, expected_const))

    print(f"\n--- UNLINKED MENU ITEMS (Menu URL does not exist in MainRoutes) ---")
    for item in unlinked_menu_items:
        print(f"Menu ID: {item['id']} in {item['file']}")
        print(f"  Menu URL: {item['url']}")
        print(f"  Page Code: {item['pageCode']}")
        # Try to find a route with same page code or containing URL subparts
        potential_routes = [path for path, el in routes.items() if item['pageCode'] in el or item['url'].split('/')[-1] in path]
        if potential_routes:
            print(f"  Potential Route Match in MainRoutes: {', '.join(potential_routes)}")
        print()

    print(f"--- MISSING PAGE GUARDS IN ROUTES (Route exists but not guarded) ---")
    for url, page_code, element in missing_guards:
        const_name = code_to_const.get(page_code, f"UNKNOWN_{page_code}")
        print(f"Route Path: {url}")
        print(f"  Expected Code: {page_code} (PAGE_CODES.{const_name})")
        print(f"  Current Element: {element}")
        print()

    print(f"--- INCORRECT PAGE GUARDS (Guard doesn't match menu pageCode) ---")
    for url, page_code, actual_const, expected_const in incorrect_guards:
        print(f"Route Path: {url}")
        print(f"  Menu Page Code: {page_code} (expected PAGE_CODES.{expected_const})")
        print(f"  Actual Guard: PAGE_CODES.{actual_const}")
        print()

if __name__ == '__main__':
    main()
