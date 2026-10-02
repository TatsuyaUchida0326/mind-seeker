import bpy
import math
import os
from mathutils import Vector

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Reproducible, low-poly/stylized 3D character prototype for MIND SEEKER.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.materials,):
    for block in list(datablocks):
        datablocks.remove(block)

def mat(name, color, roughness=0.78, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    return m

teal = mat('Cloak | deep teal', (0.035, 0.24, 0.23))
teal_light = mat('Cloak | raised folds', (0.07, 0.34, 0.31))
cream = mat('Linen | warm ivory', (0.78, 0.69, 0.52))
scarf = mat('Scarf | golden ochre', (0.73, 0.36, 0.09))
leather = mat('Leather | chestnut', (0.22, 0.085, 0.035))
leather_light = mat('Leather | warm edge', (0.38, 0.17, 0.065))
hair = mat('Hair | dark brown', (0.075, 0.043, 0.028))
skin = mat('Skin | warm', (0.72, 0.43, 0.29))
skin_light = mat('Skin | highlight', (0.85, 0.56, 0.39))
pants = mat('Trousers | charcoal', (0.105, 0.13, 0.14))
boots = mat('Boots | dark leather', (0.12, 0.065, 0.04))
gold = mat('Buckle | aged brass', (0.72, 0.46, 0.13), 0.38, 0.35)
eye = mat('Eyes', (0.07, 0.045, 0.03))

def smooth(obj, material, bevel=0):
    obj.data.materials.append(material)
    if obj.type == 'MESH' and len(obj.data.polygons) > 8:
        for p in obj.data.polygons: p.use_smooth = True
    if bevel:
        mod = obj.modifiers.new('Soft crafted edges', 'BEVEL'); mod.width = bevel; mod.segments = 2
        obj.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
    return obj

def uv(name, loc, scale, material, segments=24, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return smooth(o,material)

def cylinder(name, a, b, radius, material, vertices=12, radius2=None):
    mid=(Vector(a)+Vector(b))/2; direction=Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=radius if radius2 is None else radius2, depth=direction.length, location=mid)
    o=bpy.context.object; o.name=name; o.rotation_mode='QUATERNION'; o.rotation_quaternion=direction.to_track_quat('Z','Y')
    return smooth(o,material,0.025)

def mesh(name, verts, faces, material, thickness=0):
    me=bpy.data.meshes.new(name); me.from_pydata(verts,[],faces); me.materials.append(material)
    ob=bpy.data.objects.new(name,me); bpy.context.collection.objects.link(ob)
    if thickness:
        s=ob.modifiers.new('Tailored thickness','SOLIDIFY'); s.thickness=thickness
        b=ob.modifiers.new('Soft hem','BEVEL'); b.width=0.035; b.segments=2
    return ob

def curve(name, points, radius, material, bevel_resolution=3):
    cu=bpy.data.curves.new(name,'CURVE'); cu.dimensions='3D'; cu.bevel_depth=radius; cu.bevel_resolution=bevel_resolution
    sp=cu.splines.new('BEZIER'); sp.bezier_points.add(len(points)-1)
    for p,co in zip(sp.bezier_points,points): p.co=co; p.handle_left_type='AUTO'; p.handle_right_type='AUTO'
    ob=bpy.data.objects.new(name,cu); bpy.context.collection.objects.link(ob); ob.data.materials.append(material); return ob

# Grounded stance and sturdy travel boots.
for x in (-0.23,0.23):
    uv('Boot | rounded toe',(x,-0.12,0.17),(0.19,0.31,0.16),boots)
    cylinder('Boot shaft',(x,0,0.2),(x,0,0.61),0.115,boots,12,0.13)
    cylinder('Trouser leg',(x,0,0.55),(x*0.92,0.015,1.18),0.13,pants,12,0.19)

# Cloak, wide at its hem, behind torso. Its silhouette reads clearly in 3/4 view.
verts=[(-0.24,0.17,2.13),(0.24,0.17,2.13),(-0.50,0.20,1.65),(0.50,0.20,1.65),(-0.69,0.25,0.72),(0.69,0.25,0.72)]
mesh('Teal travel cloak',verts,[(0,2,4),(0,4,5,3),(0,1,3,2),(2,3,5,4)],teal,0.07)
for x in (-0.43,-0.2,0.18,0.43):
    curve('Cloak pleat',[(x*0.52,0.135,1.82),(x*0.85,0.13,1.32),(x,0.20,0.78)],0.018,teal_light,2)

# Tunic torso, neck and arms.
cylinder('Ivory tunic',(0,0,1.12),(0,0,2.08),0.32,cream,16,0.25)
uv('Shoulders',(0,0,1.91),(0.34,0.235,0.18),cream)
cylinder('Neck',(0,-0.005,2.02),(0,-0.005,2.27),0.13,skin,16)
for side in (-1,1):
    # Sleeves and forearms angle naturally toward the belt.
    cylinder('Linen sleeve',(side*.31,0,1.88),(side*.45,-0.015,1.48),0.16,cream,12,0.115)
    cylinder('Leather bracer',(side*.45,-0.025,1.52),(side*.49,-0.04,1.30),0.12,leather_light,12,0.105)
    cylinder('Forearm',(side*.49,-0.04,1.32),(side*.46,-0.09,1.12),0.095,skin,12,0.075)
    uv('Hand',(side*.46,-0.10,1.07),(0.09,0.085,0.12),skin_light)

# Face, ears and swept dark hair; no beard, youthful early-20s appearance.
uv('Face',(0,-0.045,2.55),(0.275,0.25,0.34),skin,32,24)
uv('Nose',(0,-0.285,2.51),(0.04,0.045,0.06),skin_light,16,12)
for x in (-0.27,0.27): uv('Ear',(x,-0.04,2.54),(0.065,0.07,0.105),skin_light,16,12)
uv('Hair cap',(0,0.005,2.78),(0.29,0.255,0.19),hair,32,20)
uv('Swept fringe',(-0.105,-0.237,2.72),(0.20,0.075,0.105),hair)
uv('Side lock',(0.225,-0.07,2.63),(0.075,0.11,0.20),hair)
for x in (-0.105,0.105):
    uv('Eye',(x,-0.278,2.57),(0.027,0.016,0.035),eye,16,12)
    uv('Eye glint',(x-0.006,-0.292,2.582),(0.008,0.006,0.01),cream,12,8)
curve('Subtle smile',[(-0.06,-0.286,2.43),(0,-0.296,2.415),(0.06,-0.286,2.43)],0.009,leather,2)

# Ochre scarf wraps the neck; a short folded end sits on the chest.
uv('Scarf wrap',(0,-0.09,2.17),(0.24,0.23,0.105),scarf)
mesh('Scarf drape',[(-0.13,-0.265,2.20),(0.04,-0.29,2.20),(0.20,-0.30,1.72),(0.02,-0.31,1.78)],[(0,1,2,3)],scarf,0.045)
curve('Scarf fold',[(-0.09,-0.294,2.13),(0.01,-0.31,1.96),(0.10,-0.32,1.78)],0.012,leather_light,2)

# Cross-body leather strap and compact satchel at the character's left hip.
curve('Satchel strap',[(0.28,-0.20,2.02),(0.15,-0.30,1.82),(-0.05,-0.31,1.55),(-0.27,-0.25,1.28)],0.032,leather_light,4)
uv('Satchel body',(-0.39,-0.18,1.30),(0.19,0.16,0.23),leather,24,18)
uv('Satchel flap',(-0.39,-0.322,1.43),(0.17,0.035,0.095),leather_light,24,16)
uv('Satchel clasp',(-0.39,-0.351,1.38),(0.028,0.012,0.038),gold,16,12)

# Belt, visible buckle, and small utility pouch.
curve('Travel belt',[(-0.30,-0.09,1.28),(-0.20,-0.20,1.24),(0,-0.24,1.23),(0.20,-0.20,1.24),(0.30,-0.09,1.28)],0.042,leather,4)
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,-0.255,1.25)); buckle=bpy.context.object; buckle.name='Brass belt buckle'; buckle.scale=(0.13,0.035,0.11); bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); smooth(buckle,gold,0.025)
uv('Buckle inset',(0,-0.279,1.25),(0.055,0.012,0.04),leather,12,8)
uv('Utility pouch',(0.30,-0.12,1.20),(0.14,0.13,0.18),leather_light,16,12)

# Small cloak clasp at collar.
uv('Cloak clasp',(0,-0.31,2.05),(0.07,0.035,0.07),gold,16,12)

# Stage: warm neutral studio ground and soft three-point lighting.
ground=mat('Backdrop | warm slate',(0.105,0.13,0.14))
bpy.ops.mesh.primitive_plane_add(size=200, location=(0,0,-0.015)); plane=bpy.context.object; plane.name='Studio floor'; smooth(plane,ground)
plane.hide_render=True
world=bpy.context.scene.world or bpy.data.worlds.new('World'); bpy.context.scene.world=world; world.color=(0.22,0.22,0.22)
def area(name, loc, energy, size, color, target=(0,0,1.45)):
    bpy.ops.object.light_add(type='AREA', location=loc); l=bpy.context.object; l.name=name; l.data.energy=energy; l.data.shape='DISK'; l.data.size=size; l.data.color=color; l.rotation_euler=(Vector(target)-l.location).to_track_quat('-Z','Y').to_euler()
area('Key | warm softbox',(-3,-4,6),520,4.2,(1.0,0.78,0.58))
area('Fill | cool softbox',(4,-3,3.5),350,3.6,(0.62,0.82,1.0))
area('Rim | cloak edge',(1.5,2.5,4.5),650,3.0,(1.0,0.62,0.30))

bpy.ops.object.camera_add(location=(0,-9,1.52)); cam=bpy.context.object; cam.name='Character portrait camera'; cam.rotation_euler=(Vector((0,0,1.52))-cam.location).to_track_quat('-Z','Y').to_euler(); cam.data.type='ORTHO'; cam.data.ortho_scale=3.34
scene=bpy.context.scene; scene.camera=cam
scene.render.engine='CYCLES'; scene.cycles.samples=32
scene.render.resolution_x=900; scene.render.resolution_y=1080; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
scene.render.filepath=os.path.join(OUTPUT_DIR,'traveler_preview.png')
scene.camera.data.lens=50

# Organize the outliner while keeping the prototype simple to edit.
for ob in bpy.context.scene.objects:
    if ob.type=='MESH' and ob.name not in ('Studio floor',):
        ob.select_set(False)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTPUT_DIR,'traveler.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUTPUT_DIR,'traveler.glb'),export_format='GLB',use_selection=False,export_apply=True)
bpy.ops.render.render(write_still=True)
